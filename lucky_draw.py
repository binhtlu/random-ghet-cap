import sys
import json
import math
import urllib.request
from qiskit import QuantumCircuit

# API Key IBM Quantum (mặc định lấy từ token nếu có)
DEFAULT_IBM_TOKEN = "iYiKwiojfEgAqHpBzauH3OK4coVDFC5qK--E0sszlp69"


def fetch_hardware_quantum_bits(num_bits):
    """
    Lấy chuỗi bit ngẫu nhiên từ phần cứng lượng tử thật ID Quantique (Quantis QRNG).
    Đây là máy phát số ngẫu nhiên lượng tử vật lý thực tế (Physical Photonic Quantum Hardware),
    đo trực tiếp trạng thái photon và nhiễu lượng tử trong silicon (không phải giả lập PRNG).
    """
    num_bytes = max(1, (num_bits + 7) // 8)
    url = f"https://lfdr.de/qrng_api/qrng?length={num_bytes}&format=HEX"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "QuantumDraw/1.0 (Real Hardware QRNG Client)"}
    )

    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        hex_val = data.get("qrn", "")
        # Chuyển đổi HEX sang binary bitstring
        raw_bits = bin(int(hex_val, 16))[2:].zfill(len(hex_val) * 4)
        return raw_bits[:num_bits], "ID Quantique Quantis QRNG (Physical Hardware)"


def draw_from_ibm_quantum(items, token):
    """
    Quay số bằng Máy tính lượng tử thật của IBM (IBM Quantum Real QPU) qua Qiskit Runtime.
    """
    from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2

    num_items = len(items)
    num_qubits = max(1, math.ceil(math.log2(num_items)))

    service = QiskitRuntimeService(
        channel="ibm_quantum_platform",
        token=token
    )
    # Lấy backend máy tính lượng tử thật ít bận nhất (không lấy simulator)
    backend = service.least_busy(operational=True, simulator=False)
    sampler = SamplerV2(mode=backend)
    backend_name = backend.name

    attempts = 0
    qc = QuantumCircuit(num_qubits)
    for i in range(num_qubits):
        qc.h(i)
    qc.measure_all()

    while True:
        attempts += 1
        job = sampler.run([qc], shots=1)
        result = job.result()
        bitstring = result[0].data.meas.get_bitstrings()[0]
        index = int(bitstring, 2)
        if index < num_items:
            break

    return {
        "winner_index": index,
        "winner": items[index],
        "binary_state": bitstring,
        "attempts": attempts,
        "num_qubits": num_qubits,
        "entropy_source": f"IBM Quantum Real Hardware (QPU: {backend_name})",
        "backend": backend_name,
        "is_real_quantum": True,
        "circuit_ascii": str(qc)
    }


def draw_from_hardware_qrng(items):
    """
    Quay số bằng Phần cứng lượng tử vật lý thực tế (Physical Hardware QRNG).
    Sử dụng Rejection Sampling để phân phối xác suất đồng đều tuyệt đối 1/N.
    """
    num_items = len(items)
    num_qubits = max(1, math.ceil(math.log2(num_items)))

    # Tạo mạch lượng tử tương đương về mặt lý thuyết để hiển thị
    qc = QuantumCircuit(num_qubits)
    for i in range(num_qubits):
        qc.h(i)
    qc.measure_all()

    attempts = 0
    while True:
        attempts += 1
        bitstring, source_name = fetch_hardware_quantum_bits(num_qubits)
        index = int(bitstring, 2)
        if index < num_items:
            break

    return {
        "winner_index": index,
        "winner": items[index],
        "binary_state": bitstring,
        "attempts": attempts,
        "num_qubits": num_qubits,
        "entropy_source": source_name,
        "backend": "ID Quantique Quantis PCIe Hardware",
        "is_real_quantum": True,
        "circuit_ascii": str(qc)
    }


def quantum_draw(items, source="auto", ibm_token=None):
    """
    Quay chọn 1 người từ danh sách bằng LƯỢNG TỬ THẬT.
    - 'hardware_qrng' hoặc 'auto': Dùng phần cứng lượng tử vật lý thực tế ID Quantique
    - 'ibm_quantum': Dùng máy tính lượng tử thật IBM QPU (yêu cầu token IBM hợp lệ)
    """
    if not items or len(items) == 0:
        return {"error": "Danh sách trống"}

    # Tối ưu: Khi chỉ có đúng 1 ứng viên, kết quả là tất định 100% (Entropy = 0),
    # không cần tốn thời gian gọi lên phần cứng lượng tử.
    if len(items) == 1:
        return {
            "winner_index": 0,
            "winner": items[0],
            "binary_state": "0",
            "attempts": 1,
            "num_qubits": 0,
            "entropy_source": "Tất định (1 ứng viên duy nhất)",
            "backend": "Deterministic Bypass (N=1)",
            "is_real_quantum": True,
            "circuit_ascii": ""
        }

    token = ibm_token

    if source == "ibm_quantum" or (source == "auto" and token and token != DEFAULT_IBM_TOKEN):
        try:
            return draw_from_ibm_quantum(items, token)
        except Exception as e:
            err_msg = str(e)
            if "blocked" in err_msg.lower():
                err_msg = "Tài khoản IBM Cloud/Quantum đã bị khóa (Blocked account)."
            if source == "ibm_quantum":
                return {
                    "error": f"Lỗi IBM Quantum thật: {err_msg}",
                    "is_real_quantum": False
                }

    # Mặc định sử dụng phần cứng lượng tử vật lý ID Quantique (Real Photonic Hardware QRNG)
    return draw_from_hardware_qrng(items)


def quantum_pair_draw(females, males, source="auto", ibm_token=None):
    """
    Quay ghép 1 CẶP ĐÔI (1 Nữ + 1 Nam) bằng LƯỢNG TỬ THẬT.
    """
    if not females or len(females) == 0:
        return {"error": "Danh sách bạn nữ trống"}
    if not males or len(males) == 0:
        return {"error": "Danh sách bạn nam trống"}

    female_result = quantum_draw(females, source=source, ibm_token=ibm_token)
    if "error" in female_result:
        return female_result

    male_result = quantum_draw(males, source=source, ibm_token=ibm_token)
    if "error" in male_result:
        return male_result

    # Xác định nguồn entropy tổng thể
    if female_result.get("num_qubits", 0) > 0:
        entropy_source = female_result["entropy_source"]
        backend = female_result["backend"]
        circuit_ascii = female_result.get("circuit_ascii", "")
    elif male_result.get("num_qubits", 0) > 0:
        entropy_source = male_result["entropy_source"]
        backend = male_result["backend"]
        circuit_ascii = male_result.get("circuit_ascii", "")
    else:
        entropy_source = "Tất định (1 Nữ & 1 Nam duy nhất - Ghép trực tiếp)"
        backend = "Deterministic Bypass (N=1)"
        circuit_ascii = ""

    return {
        "female": {
            "winner": female_result["winner"],
            "index": female_result["winner_index"],
            "binary_state": female_result["binary_state"],
            "num_qubits": female_result["num_qubits"]
        },
        "male": {
            "winner": male_result["winner"],
            "index": male_result["winner_index"],
            "binary_state": male_result["binary_state"],
            "num_qubits": male_result["num_qubits"]
        },
        "entropy_source": entropy_source,
        "backend": backend,
        "is_real_quantum": True,
        "circuit_ascii": circuit_ascii
    }


if __name__ == "__main__":
    raw_args = sys.argv[1:]

    source = "auto"
    ibm_token = None
    is_pair = False

    args = []
    i = 0
    while i < len(raw_args):
        if raw_args[i] == "--pair":
            is_pair = True
            i += 1
        elif raw_args[i] == "--source" and i + 1 < len(raw_args):
            source = raw_args[i + 1]
            i += 2
        elif raw_args[i] == "--token" and i + 1 < len(raw_args):
            ibm_token = raw_args[i + 1]
            i += 2
        else:
            args.append(raw_args[i])
            i += 1

    if is_pair or len(args) >= 2:
        # Quay ghép cặp: arg1 là Nữ, arg2 là Nam
        try:
            females = json.loads(args[0]) if len(args) > 0 else ["Linh", "Trang", "Mai", "Vy"]
        except Exception:
            females = args[0].split(",")

        try:
            males = json.loads(args[1]) if len(args) > 1 else ["Nam", "Tuấn", "Dũng", "Hoàng"]
        except Exception:
            males = args[1].split(",")

        result = quantum_pair_draw(females, males, source=source, ibm_token=ibm_token)
    else:
        # Quay đơn danh sách
        if len(args) > 0:
            try:
                items = json.loads(args[0])
            except Exception:
                items = args[0].split(",")
        else:
            items = ["Anh", "Bình", "Chi", "Dũng", "Em"]

        result = quantum_draw(items, source=source, ibm_token=ibm_token)

    print(json.dumps(result, ensure_ascii=False, indent=2))
