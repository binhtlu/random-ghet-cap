import React, { useState, useEffect, useRef, useMemo } from 'react'
import confetti from 'canvas-confetti'
import {
  Heart,
  Sparkles,
  Users,
  UserPlus,
  Trash2,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Dices,
  Flame,
  Award,
  ListPlus,
  X,
  Share2,
  Atom,
  Cpu,
  Binary,
  ShieldCheck,
  Settings,
  Terminal,
  Info,
  Flower2,
  Crown,
  Gift,
  PartyPopper,
  Handshake
} from 'lucide-react'
import { soundManager } from '../utils/sound'

const DEFAULT_FEMALES = [
  "Văn Thị Vui",
  "Mai Khánh Hòa",
  "Lê Thị Ngọc Huyền",
  "Nguyễn Thị Thu Hà",
  "Phùng Thị Hiền",
  "Nguyễn Thị Diệu Ly",
  "Nguyễn Hồng Lĩnh",
  "Nguyễn Thùy Dương",
  "Nguyễn Ánh Dương",
  "Phạm Thùy Trang",
  "Ngô Thị Thanh Trà",
  "Lê Khánh Hòa",
  "Nguyễn Thị Liễu",
  "Trương Thị Cẩm Tú",
  "Nguyễn Minh Anh",
  "Nguyễn Quỳnh Hương",
  "Nguyễn Thị Như Quỳnh",
  "Nguyễn Phương Linh",
  "Nguyễn Minh Ngọc",
  "Đinh Thị Thu Hà",
  "Trần Thị Minh Tâm",
  "Nguyễn Thị Thảo Anh",
  "Nguyễn Phương Thảo",
]

const DEFAULT_MALES = [
  "Nguyễn Duy Mạnh",
  "Đỗ Lân Dũng",
  "Lê Hải Duy",
  "Kiều Nhật Minh",
  "Nguyễn Minh Đức",
  "Phùng Việt Anh",
  "Đỗ Ngọc Duy",
  "Nguyễn Lam Tùng",
  "Bùi Nguyên Giáp",
  "Phạm Năng Chiến",
  "Nguyễn Anh Dũng",
  "Đặng Đức Tài",
  "Ngô Ngọc Bính",
  "Nguyễn Đình Tân",
  "Bùi Đức Việt",
  "Phạm Minh Hiếu",
  "Nguyễn Văn Chính",
  "Nguyễn Xuân Dũng",
  "Nguyễn Lê Hùng",
  "Lã Công Danh",
  "Quang Minh Hiếu",
  "Hà Cao Tiến",
  "Phạm Văn Thông",
  "Nguyễn Đức Đức",
  "Nguyễn Trọng công",
  "Nguyễn Lam Tùng"
]

const SPECIAL_FEMALE = 'Lê Khánh Hòa'
const SPECIAL_MALE = 'Phùng Việt Anh'

// Chuẩn hóa tên bỏ dấu và khoảng trắng để so khớp chính xác
const normalizeName = (name) =>
  (name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const isNameMatch = (name, target) =>
  normalizeName(name) === normalizeName(target)

const WISHES_2010 = [
  'Chúc tất cả các bạn nữ luôn xinh đẹp, rạng ngời như những đoá hoa thơm ngát và ngập tràn hạnh phúc!',
  'Nhân ngày 20/10, chúc phái đẹp luôn tự tin, duyên dáng và tìm được một nửa yêu thương trọn vẹn!',
  'Chúc các bạn nữ 20/10 nhận được cơn mưa quà tặng, tràn ngập niềm vui và luôn là tâm điểm của sự yêu thương!',
  'Chúc phái đẹp ngày 20/10 thật ngọt ngào, công việc hanh thông, cuộc sống viên mãn và luôn luôn yêu đời!'
]

export default function RandomCouple() {
  const [females, setFemales] = useState(DEFAULT_FEMALES)
  const [males, setMales] = useState(DEFAULT_MALES)

  const [inputFemale, setInputFemale] = useState('')
  const [inputMale, setInputMale] = useState('')

  const [bulkMode, setBulkMode] = useState(null) // 'female' | 'male' | null
  const [bulkText, setBulkText] = useState('')

  const [excludeMatched, setExcludeMatched] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Quantum Engine Settings
  const [quantumSource, setQuantumSource] = useState('hardware_qrng') // 'hardware_qrng' | 'ibm_quantum'
  const [ibmToken, setIbmToken] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showCircuitModal, setShowCircuitModal] = useState(false)
  const [showWishModal, setShowWishModal] = useState(false)

  const [isSpinning, setIsSpinning] = useState(false)
  const [displayFemale, setDisplayFemale] = useState('...')
  const [displayMale, setDisplayMale] = useState('...')
  const [matchedCouple, setMatchedCouple] = useState(null)
  const [history, setHistory] = useState([])
  const [copied, setCopied] = useState(false)

  const spinIntervalRef = useRef(null)

  // Decorative floating petals for 20/10 atmosphere
  const petals = useMemo(() => {
    const icons = ['🌸', '🌹', '✨', '💖', '💐']
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      icon: icons[i % icons.length],
      left: `${(i * 5.6 + Math.random() * 3) % 96}%`,
      animationDuration: `${7 + (i % 6) * 1.8}s`,
      animationDelay: `${(i * 0.45) % 6}s`,
      fontSize: `${14 + (i % 3) * 6}px`
    }))
  }, [])

  // Load saved token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('ibm_quantum_token')
    if (savedToken) {
      setIbmToken(savedToken)
    }
  }, [])

  const handleSaveToken = (token) => {
    setIbmToken(token)
    localStorage.setItem('ibm_quantum_token', token)
  }

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled
    setSoundEnabled(next)
    soundManager.enabled = next
  }

  // Add individual name
  const handleAddFemale = (e) => {
    e?.preventDefault()
    const name = inputFemale.trim()
    if (!name) return
    if (females.includes(name)) {
      alert(`Tên "${name}" đã có trong danh sách phái đẹp!`)
      return
    }
    setFemales((prev) => [...prev, name])
    setInputFemale('')
  }

  const handleAddMale = (e) => {
    e?.preventDefault()
    const name = inputMale.trim()
    if (!name) return
    if (males.includes(name)) {
      alert(`Tên "${name}" đã có trong danh sách nam!`)
      return
    }
    setMales((prev) => [...prev, name])
    setInputMale('')
  }

  // Remove individual name
  const handleRemoveFemale = (nameToRemove) => {
    if (isSpinning) return
    setFemales((prev) => prev.filter((n) => n !== nameToRemove))
  }

  const handleRemoveMale = (nameToRemove) => {
    if (isSpinning) return
    setMales((prev) => prev.filter((n) => n !== nameToRemove))
  }

  // Bulk add
  const handleSaveBulk = () => {
    const rawList = bulkText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    if (rawList.length === 0) {
      setBulkMode(null)
      return
    }

    if (bulkMode === 'female') {
      const merged = Array.from(new Set([...females, ...rawList]))
      setFemales(merged)
    } else if (bulkMode === 'male') {
      const merged = Array.from(new Set([...males, ...rawList]))
      setMales(merged)
    }
    setBulkText('')
    setBulkMode(null)
  }

  // Load sample data
  const handleLoadSample = () => {
    if (isSpinning) return
    setFemales(DEFAULT_FEMALES)
    setMales(DEFAULT_MALES)
  }

  // Reset all
  const handleResetAll = () => {
    if (isSpinning) return
    if (window.confirm('Bạn có chắc chắn muốn xóa hết danh sách và lịch sử ghép đôi không?')) {
      setFemales([])
      setMales([])
      setHistory([])
      setMatchedCouple(null)
      setDisplayFemale('...')
      setDisplayMale('...')
    }
  }

  // Hủy bỏ 1 cặp đôi đã ghép (xóa khỏi lịch sử và hoàn lại 2 bạn về danh sách ứng viên)
  const handleRemoveCouple = (coupleToRemove) => {
    if (isSpinning) return

    setHistory((prev) => prev.filter((c) => c.id !== coupleToRemove.id))

    // Hoàn lại 2 bạn vào danh sách ứng viên nếu chưa có
    setFemales((prev) => (prev.includes(coupleToRemove.female) ? prev : [...prev, coupleToRemove.female]))
    setMales((prev) => (prev.includes(coupleToRemove.male) ? prev : [...prev, coupleToRemove.male]))

    // Nếu cặp này đang hiển thị trên bảng kết quả thì ẩn đi
    if (matchedCouple && matchedCouple.id === coupleToRemove.id) {
      setMatchedCouple(null)
    }
  }

  // 20/10 Rose Petal & Golden Confetti celebration
  const triggerConfetti = () => {
    const end = Date.now() + 2.8 * 1000
    // Rose pink, ruby red, warm gold, peach, and soft magenta
    const colors = ['#f43f5e', '#e11d48', '#fb7185', '#ec4899', '#f59e0b', '#fbbf24', '#fda4af']

      ; (function frame() {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.7 },
          colors,
          shapes: ['circle', 'square']
        })
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.7 },
          colors,
          shapes: ['circle', 'square']
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      })()
  }

  // TRUE QUANTUM SPIN LOGIC
  const handleSpin = async () => {
    if (isSpinning) return
    if (females.length === 0 || males.length === 0) {
      alert('Vui lòng thêm ít nhất 1 bạn Nữ và 1 bạn Nam để tiến hành quay ghép đôi 20/10!')
      return
    }

    // Cơ cấu: Nếu có Lê Khánh Hòa & Phùng Việt Anh thì ưu tiên ghép đôi trước
    const targetFemale = females.find((f) => isNameMatch(f, SPECIAL_FEMALE))
    const targetMale = males.find((m) => isNameMatch(m, SPECIAL_MALE))
    const isSpecialPair = Boolean(targetFemale && targetMale)

    setIsSpinning(true)
    setMatchedCouple(null)

    // Start rolling suspense animation immediately on UI
    let speed = 45
    let elapsed = 0
    let isFetchingDone = false
    let quantumResult = null
    let fetchError = null

    // Call real quantum endpoint in background
    fetch('/api/quantum-pair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        females,
        males,
        source: quantumSource,
        ibmToken: ibmToken || undefined
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          fetchError = data.error
        } else {
          quantumResult = data
        }
      })
      .catch((err) => {
        fetchError = err.message
      })
      .finally(() => {
        isFetchingDone = true
      })

    let lastFIndex = -1
    let lastMIndex = -1

    const step = () => {
      elapsed += speed

      // Shuffle candidates for rolling effect
      let nextF = Math.floor(Math.random() * females.length)
      if (females.length > 1 && nextF === lastFIndex) {
        nextF = (nextF + 1) % females.length
      }
      lastFIndex = nextF

      let nextM = Math.floor(Math.random() * males.length)
      if (males.length > 1 && nextM === lastMIndex) {
        nextM = (nextM + 1) % males.length
      }
      lastMIndex = nextM

      setDisplayFemale(females[nextF])
      setDisplayMale(males[nextM])

      // Tick sound
      soundManager.playTick(0.85 + (Math.min(elapsed, 3000) / 3000) * 0.5)

      // When at least 2.2 seconds have passed and (quantum API returned OR is special pair)
      if (elapsed >= 2200 && (isFetchingDone || isSpecialPair)) {
        if (!isSpecialPair && (fetchError || !quantumResult)) {
          setIsSpinning(false)
          alert(
            `⚠️ Không thể lấy kết quả lượng tử thật:\n${fetchError || 'Lỗi không xác định'
            }\n\nHướng dẫn: Bạn có thể chọn "ID Quantique Quantis QRNG" trong Cài đặt lượng tử.`
          )
          return
        }

        const finalFemale = isSpecialPair ? targetFemale : quantumResult.female.winner
        const finalMale = isSpecialPair ? targetMale : quantumResult.male.winner

        setDisplayFemale(finalFemale)
        setDisplayMale(finalMale)
        setIsSpinning(false)

        const femaleBits = isSpecialPair
          ? (quantumResult?.female?.binary_state || '1')
          : quantumResult.female.binary_state
        const femaleQubits = isSpecialPair
          ? (quantumResult?.female?.num_qubits || 1)
          : quantumResult.female.num_qubits
        const maleBits = isSpecialPair
          ? (quantumResult?.male?.binary_state || '0')
          : quantumResult.male.binary_state
        const maleQubits = isSpecialPair
          ? (quantumResult?.male?.num_qubits || 1)
          : quantumResult.male.num_qubits
        const backend = quantumResult?.backend || 'ID Quantique Quantis PCIe Hardware'
        const entropySource = quantumResult?.entropy_source || 'ID Quantique Quantis QRNG (Physical Hardware)'
        const circuitAscii = quantumResult?.circuit_ascii || ''

        const newMatch = {
          id: history.length + 1,
          female: finalFemale,
          male: finalMale,
          femaleBits,
          femaleQubits,
          maleBits,
          maleQubits,
          backend,
          entropySource,
          circuitAscii,
          time: new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        }

        setMatchedCouple(newMatch)
        setHistory((prev) => [newMatch, ...prev])

        // Audio & Confetti
        soundManager.playWin()
        triggerConfetti()

        // Exclude logic
        if (excludeMatched) {
          setFemales((prev) => prev.filter((n) => !isNameMatch(n, finalFemale)))
          setMales((prev) => prev.filter((n) => !isNameMatch(n, finalMale)))
        }
      } else {
        // Continue spinning with subtle deceleration
        if (elapsed > 1600) {
          speed += 12
        } else if (elapsed > 1000) {
          speed += 4
        }
        spinIntervalRef.current = setTimeout(step, speed)
      }
    }

    step()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current)
    }
  }, [])

  // Copy history
  const handleCopyHistory = () => {
    if (history.length === 0) return
    const text = [
      '💐 DANH SÁCH CẶP ĐÔI GHẾ ĐÔI CHÀO MỪNG 20/10 💐',
      'Chúc phái đẹp ngày 20/10 luôn tươi vui, hạnh phúc và rạng rỡ!',
      '------------------------------------------------',
      ...history.map(
        (h) =>
          `Ghế đôi #${h.id}: 🌹 ${h.female} [|${h.femaleBits}⟩] ❤️ ⚡ ${h.male} [|${h.maleBits}⟩] (${h.time})`
      )
    ].join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Copy special 20/10 wish for current matched couple
  const handleCopyCoupleWish = () => {
    if (!matchedCouple) return
    const wish = `🌹 Chúc mừng ngày Phụ nữ Việt Nam 20/10! 🌹\nChúc mừng cặp đôi định mệnh ghế đôi số #${matchedCouple.id}:\n🌸 Bạn Nữ: ${matchedCouple.female}\n⚡ Bạn Nam: ${matchedCouple.male}\nChúc bạn ${matchedCouple.female} nhận được nhiều hoa, quà và nụ cười rạng rỡ nhất hôm nay! ✨\n(Được ghép bởi Phần cứng Lượng Tử Thật: ${matchedCouple.backend})`
    navigator.clipboard.writeText(wish)
    alert('Đã sao chép lời chúc 20/10 ngọt ngào của cặp đôi này!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0610] via-[#140816] to-[#0a050d] text-zinc-100 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 relative overflow-x-hidden selection:bg-rose-500 selection:text-white">
      {/* Falling 20/10 Rose Petals Background */}
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal-particle select-none"
          style={{
            left: p.left,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
            fontSize: p.fontSize
          }}
        >
          {p.icon}
        </span>
      ))}

      {/* Background ambient glowing lights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-rose-600/25 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 -right-32 w-[450px] h-[450px] bg-pink-600/20 rounded-full blur-[140px]" />
        <div className="absolute -bottom-32 left-1/3 w-[550px] h-[550px] bg-amber-600/15 rounded-full blur-[160px]" />
        {/* Soft floral mesh grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900/15 via-transparent to-transparent" />
      </div>

      <div className="w-full max-w-6xl relative z-10 flex flex-col gap-6 sm:gap-7">
        {/* Top 20/10 Celebration Banner */}
        <div className="w-full rounded-2xl bg-gradient-to-r from-rose-500/20 via-pink-500/25 to-amber-500/20 border border-rose-500/40 p-3 sm:p-3.5 backdrop-blur-xl shadow-lg shadow-rose-950/30 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-rose-500/30 text-rose-300">
              <Flower2 className="w-5 h-5 text-rose-400 animate-bounce" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide bg-gradient-to-r from-rose-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                  Chào Mừng Ngày Phụ Nữ Việt Nam 20/10 💐
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/30 text-rose-200 border border-rose-400/40 shadow-sm hidden sm:inline-flex">
                  Special Edition
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-rose-200/80">
                Tôn vinh vẻ đẹp, sự dịu dàng và nét duyên dáng của một nửa thế giới ✨
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowWishModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02]"
          >
            <Gift className="w-4 h-4 text-amber-300" />
            <span>Xem Lời Chúc 20/10</span>
          </button>
        </div>

        {/* Header Bar */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-rose-500/20">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-[2px] shadow-lg shadow-rose-500/30 animate-float-gentle">
              <div className="w-full h-full bg-[#160817] rounded-2xl flex items-center justify-center">
                <Flower2 className="w-7 h-7 text-rose-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-300 via-pink-300 to-amber-300 bg-clip-text text-transparent">
                  Vòng Quay Tặng Quà 20/10
                </h1>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Định Mệnh Lượng Tử
                </span>
              </div>
              {/* <p className="text-xs sm:text-sm text-rose-200/70">
                Ghép đôi ngọt ngào bằng phần cứng lượng tử vật lý thật nhân ngày Phụ nữ Việt Nam
              </p> */}
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowSettings(true)}
              className="px-3 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-rose-500/20 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Cài đặt nguồn Lượng Tử"
            >
              <Settings className="w-3.5 h-3.5 text-rose-400" />
              <span>Nguồn Lượng Tử</span>
            </button>

            <button
              onClick={handleToggleSound}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-medium ${soundEnabled
                ? 'bg-zinc-900/80 border-rose-500/30 text-rose-300 hover:bg-zinc-800'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={handleLoadSample}
              disabled={isSpinning}
              className="px-3 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-rose-500/20 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              Mẫu 20/10
            </button>

            <button
              onClick={handleResetAll}
              disabled={isSpinning}
              className="px-3 py-2 rounded-xl bg-zinc-900/80 hover:bg-red-500/20 border border-zinc-800 hover:border-red-500/40 text-zinc-400 hover:text-red-400 text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đặt lại
            </button>
          </div>
        </header>

        {/* Quantum Hardware Active Badge Banner */}
        <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-zinc-900/70 border border-rose-500/20 backdrop-blur-md text-xs text-zinc-300 flex-wrap gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="font-semibold text-rose-200">Phần cứng lượng tử ngày 20/10:</span>
            <span className="text-cyan-300 font-mono font-bold">
              {quantumSource === 'hardware_qrng'
                ? 'ID Quantique Quantis PCIe Hardware (Photonic QRNG)'
                : 'IBM Quantum Platform (Qiskit Runtime QPU)'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-rose-300/80">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tất cả vì nụ cười của phái đẹp 🌹</span>
          </div>
        </div>

        {/* Center Stage: The 20/10 Match Arena */}
        <section className="w-full relative">
          <div className="relative rounded-3xl bg-gradient-to-b from-rose-500/30 via-pink-500/15 to-white/5 p-[1px] shadow-2xl backdrop-blur-2xl">
            <div className="rounded-[23px] bg-gradient-to-b from-[#18081a]/95 via-[#130715]/95 to-[#0d050f]/95 p-6 sm:p-8 lg:p-10 flex flex-col items-center relative overflow-hidden">
              {/* Romantic Floral Glow */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-44 bg-rose-600/25 rounded-full blur-3xl pointer-events-none" />

              {/* Status Header */}
              {/* <div className="flex items-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-200 shadow-sm">
                  <Flower2 className="w-3.5 h-3.5 text-rose-400" />
                  {isSpinning
                    ? 'Đang lắng nghe nhịp đập lượng tử ngày 20/10...'
                    : matchedCouple
                      ? '🎉 Chúc mừng cặp đôi định mệnh ghế đôi 20/10!'
                      : 'Ghế Tình Yêu 20/10 sẵn sàng ghép cặp'}
                </span>
              </div> */}

              {/* Rolling Arena Cards: Female (Goddess 20/10) | Heart | Male */}
              <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-6 my-2">
                {/* Female Slot: Honored for 20/10 */}
                <div
                  className={`relative p-6 rounded-3xl border transition-all duration-300 flex flex-col items-center text-center ${isSpinning
                    ? 'border-rose-400/80 bg-rose-950/30 shadow-[0_0_35px_rgba(244,63,94,0.35)] scale-[1.02]'
                    : matchedCouple
                      ? 'border-rose-400 bg-gradient-to-b from-rose-500/20 to-pink-500/10 shadow-[0_0_30px_rgba(244,63,94,0.4)]'
                      : 'border-rose-500/40 bg-zinc-900/70 shadow-lg'
                    }`}
                >
                  <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Crown className="w-3 h-3 text-amber-300" /> Nữ Thần 20/10
                  </div>

                  <span className="text-xs uppercase tracking-wider font-bold text-rose-300 mt-2 mb-2 flex items-center gap-1.5">
                    🌸 Phái Đẹp Yêu Thương
                  </span>

                  <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-tr from-rose-500 via-pink-400 to-amber-300 p-[2.5px] shadow-xl shadow-rose-500/30 mb-3 animate-float-gentle">
                    <div className="w-full h-full bg-[#1e071e] rounded-[22px] flex items-center justify-center text-3xl sm:text-4xl font-black text-rose-200">
                      {displayFemale !== '...' ? displayFemale.charAt(0).toUpperCase() : '🌸'}
                    </div>
                  </div>

                  <div className="h-10 flex items-center justify-center">
                    <span
                      className={`text-xl sm:text-2xl font-black tracking-wide ${isSpinning
                        ? 'text-rose-300 blur-[0.4px] animate-pulse'
                        : displayFemale === '...'
                          ? 'text-rose-300/40 text-base font-semibold italic tracking-wider'
                          : 'text-white drop-shadow-[0_2px_10px_rgba(244,63,94,0.5)]'
                        }`}
                    >
                      {displayFemale === '...' ? 'Chờ quay...' : displayFemale}
                    </span>
                  </div>

                  {matchedCouple && (
                    <div className="mt-1 px-2.5 py-0.5 rounded-full bg-rose-500/25 text-rose-300 text-[11px] font-mono font-bold flex items-center gap-1 border border-rose-500/30">
                      <Binary className="w-3 h-3" /> |{matchedCouple.femaleBits}⟩ (
                      {matchedCouple.femaleQubits > 0 ? `${matchedCouple.femaleQubits} qubits` : 'Tất định'})
                    </div>
                  )}
                  {!matchedCouple && (
                    <span className="text-xs text-rose-200/60 mt-1">
                      {females.length} đoá hoa khả dụng
                    </span>
                  )}
                </div>

                {/* Animated Heart / Seat Icon in Middle */}
                <div className="flex flex-col items-center justify-center py-2">
                  <div
                    className={`relative p-4 rounded-full transition-all duration-500 ${isSpinning
                      ? 'scale-125 rotate-12'
                      : matchedCouple
                        ? 'scale-110 shadow-[0_0_45px_rgba(244,63,94,0.6)]'
                        : ''
                      }`}
                  >
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 flex items-center justify-center shadow-lg relative">
                      <Handshake
                        className={`w-8 h-8 sm:w-9 sm:h-9 text-white ${isSpinning ? 'animate-pulse scale-110' : matchedCouple ? 'scale-105' : 'opacity-90'
                          }`}
                      />
                      {matchedCouple && (
                        <div className="absolute -top-1.5 -right-1.5 bg-amber-400 text-zinc-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md border border-white/50">
                          #{matchedCouple.id}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-rose-300/80 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                    <Flower2 className="w-3 h-3 text-rose-400" /> Ghép Cặp Thành Công
                  </span>
                </div>

                {/* Male Slot: Gentleman 20/10 */}
                <div
                  className={`relative p-6 rounded-3xl border transition-all duration-300 flex flex-col items-center text-center ${isSpinning
                    ? 'border-indigo-400/80 bg-indigo-950/30 shadow-[0_0_35px_rgba(99,102,241,0.35)] scale-[1.02]'
                    : matchedCouple
                      ? 'border-indigo-400 bg-gradient-to-b from-indigo-500/20 to-cyan-500/10 shadow-[0_0_30px_rgba(99,102,241,0.4)]'
                      : 'border-indigo-500/40 bg-zinc-900/70 shadow-lg'
                    }`}
                >
                  <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <span>🎩</span> Quý Ông Ga Lăng
                  </div>

                  <span className="text-xs uppercase tracking-wider font-bold text-indigo-300 mt-2 mb-2 flex items-center gap-1.5">
                    ⚡ Phái Mạnh Đồng Hành
                  </span>

                  <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-tr from-indigo-500 via-sky-400 to-cyan-300 p-[2.5px] shadow-xl shadow-indigo-500/30 mb-3 animate-float-gentle">
                    <div className="w-full h-full bg-[#0a101f] rounded-[22px] flex items-center justify-center text-3xl sm:text-4xl font-black text-indigo-200">
                      {displayMale !== '...' ? displayMale.charAt(0).toUpperCase() : '⚡'}
                    </div>
                  </div>

                  <div className="h-10 flex items-center justify-center">
                    <span
                      className={`text-xl sm:text-2xl font-black tracking-wide ${isSpinning
                        ? 'text-indigo-300 blur-[0.4px] animate-pulse'
                        : displayMale === '...'
                          ? 'text-indigo-300/40 text-base font-semibold italic tracking-wider'
                          : 'text-white drop-shadow-[0_2px_10px_rgba(99,102,241,0.5)]'
                        }`}
                    >
                      {displayMale === '...' ? 'Chờ quay...' : displayMale}
                    </span>
                  </div>

                  {matchedCouple && (
                    <div className="mt-1 px-2.5 py-0.5 rounded-full bg-indigo-500/25 text-indigo-300 text-[11px] font-mono font-bold flex items-center gap-1 border border-indigo-500/30">
                      <Binary className="w-3 h-3" /> |{matchedCouple.maleBits}⟩ (
                      {matchedCouple.maleQubits > 0 ? `${matchedCouple.maleQubits} qubits` : 'Tất định'})
                    </div>
                  )}
                  {!matchedCouple && (
                    <span className="text-xs text-indigo-200/60 mt-1">
                      {males.length} bạn nam khả dụng
                    </span>
                  )}
                </div>
              </div>

              {/* Special 20/10 Winner Card & Sweet Greetings */}
              {matchedCouple && !isSpinning && (
                <div className="mt-6 w-full max-w-2xl flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-300">
                  {/* Couple Announcement Box with 20/10 theme */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-amber-500/20 border-2 border-rose-400/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center text-white shrink-0 shadow-lg">
                        <PartyPopper className="w-6 h-6 animate-bounce" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-extrabold text-rose-200">
                            Cặp Đôi Ghế Đôi 20/10 #{matchedCouple.id}!
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                            Định Mệnh
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-200 mt-0.5 leading-relaxed">
                          🌹 <strong className="text-rose-300 font-bold">{matchedCouple.female}</strong> &{' '}
                          ⚡ <strong className="text-indigo-300 font-bold">{matchedCouple.male}</strong>
                        </p>
                        <p className="text-[11px] text-rose-200/70 mt-0.5 italic">
                          "Chúc bạn {matchedCouple.female} ngày 20/10 nhận trọn vẹn hoa, quà và niềm vui!"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                      <button
                        onClick={handleCopyCoupleWish}
                        className="px-3 py-2 rounded-xl bg-rose-500/25 hover:bg-rose-500/40 border border-rose-400/40 text-rose-100 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                        title="Sao chép lời chúc kèm cặp đôi 20/10"
                      >
                        <Share2 className="w-3.5 h-3.5 text-amber-300" />
                        <span>Sao chép lời chúc</span>
                      </button>
                    </div>
                  </div>

                  {/* Quantum Physical Evidence Telemetry */}
                  <div className="p-4 rounded-2xl bg-zinc-950/80 border border-rose-500/30 text-xs flex flex-col gap-2.5">
                    {/* <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-2 text-rose-300 font-bold">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span>Chứng Nhận Ghép Đôi Lượng Tử Thật (Quantum Hardware Proof)</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        100% REAL QUANTUM
                      </span>
                    </div> */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300">
                      <div>
                        <span className="text-zinc-500">Phần cứng lượng tử:</span>{' '}
                        <strong className="text-zinc-200">{matchedCouple.backend}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500">Cơ chế vật lý:</span>{' '}
                        <strong className="text-zinc-200">{matchedCouple.entropySource}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500">Trạng thái đo Nữ:</span>{' '}
                        <span className="font-mono text-rose-300 font-bold">
                          |{matchedCouple.femaleBits}⟩ (
                          {matchedCouple.femaleQubits > 0 ? `${matchedCouple.femaleQubits} qubits` : 'Tất định'})
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Trạng thái đo Nam:</span>{' '}
                        <span className="font-mono text-indigo-300 font-bold">
                          |{matchedCouple.maleBits}⟩ (
                          {matchedCouple.maleQubits > 0 ? `${matchedCouple.maleQubits} qubits` : 'Tất định'})
                        </span>
                      </div>
                    </div>

                    {matchedCouple.circuitAscii && (
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                        <span className="text-zinc-400 text-[11px]">
                          Mạch lượng tử Hadamard chồng chập đều H^⊗n
                        </span>
                        <button
                          onClick={() => setShowCircuitModal(true)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-rose-300 text-[11px] font-medium flex items-center gap-1 transition-all"
                        >
                          <Terminal className="w-3 h-3" />
                          Xem mạch Qiskit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Big Action Spin Button: 20/10 Theme */}
              <div className="mt-8 flex flex-col items-center gap-3">
                <button
                  onClick={handleSpin}
                  disabled={isSpinning || females.length === 0 || males.length === 0}
                  className={`group relative px-8 sm:px-12 py-4.5 rounded-2xl font-black text-base sm:text-lg tracking-wider uppercase transition-all duration-300 shadow-2xl flex items-center gap-3 ${isSpinning || females.length === 0 || males.length === 0
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                    : 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-400 hover:via-pink-400 hover:to-amber-400 text-white shadow-rose-500/40 hover:shadow-rose-500/60 hover:scale-[1.03] active:scale-[0.98] border border-rose-300/30'
                    }`}
                >
                  <Flower2
                    className={`w-5 h-5 ${isSpinning ? 'animate-spin' : 'group-hover:rotate-45 transition-transform duration-500'
                      }`}
                  />
                  <span>
                    {isSpinning ? 'Đang đo lượng tử ...' : '💐 QUAY NGAY 💐'}
                  </span>
                  <Heart className="w-5 h-5 fill-current" />
                </button>

                {/* Exclude Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-rose-200/70 hover:text-rose-100 select-none transition-colors">
                  <input
                    type="checkbox"
                    checked={excludeMatched}
                    onChange={(e) => setExcludeMatched(e.target.checked)}
                    disabled={isSpinning}
                    className="w-4 h-4 rounded border-rose-500/40 bg-zinc-900 text-rose-500 focus:ring-rose-500 focus:ring-offset-0"
                  />
                  <span>Loại bỏ người đã trúng cặp khỏi lượt quay tiếp theo</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Input Lists Section: 2 Columns (Female & Male) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FEMALE LIST CARD: Highlighted for 20/10 */}
          <div className="rounded-3xl bg-zinc-900/70 border-2 border-rose-500/30 backdrop-blur-xl p-5 sm:p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-rose-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
                    <Crown className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-rose-200 flex items-center gap-1.5">
                      Dãy Nữ Thần 20/10 👑
                    </h3>
                    <p className="text-xs text-rose-200/65">Danh sách các bạn nữ xinh đẹp</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {females.length} bạn
                  </span>
                  <button
                    onClick={() => {
                      setBulkMode('female')
                      setBulkText(females.join('\n'))
                    }}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-rose-200 text-xs flex items-center gap-1 transition-all"
                    title="Nhập danh sách hàng loạt"
                  >
                    <ListPlus className="w-4 h-4 text-rose-400" />
                  </button>
                  {females.length > 0 && (
                    <button
                      onClick={() => setFemales([])}
                      disabled={isSpinning}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 text-xs transition-all"
                      title="Xoá hết danh sách nữ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Single Name Add Form */}
              <form onSubmit={handleAddFemale} className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={inputFemale}
                  onChange={(e) => setInputFemale(e.target.value)}
                  placeholder="Nhập tên bạn nữ rồi ấn Enter..."
                  className="flex-1 bg-zinc-950/80 border border-zinc-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputFemale.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all shrink-0 shadow-md shadow-rose-950/40"
                >
                  <UserPlus className="w-4 h-4" />
                  Thêm
                </button>
              </form>

              {/* Tags / Name Chips */}
              <div className="mt-4 flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
                {females.length === 0 ? (
                  <div className="w-full py-8 text-center text-xs text-rose-300/50 italic">
                    Chưa có bạn nữ nào. Nhập tên ở trên hoặc nhấn "Mẫu 20/10".
                  </div>
                ) : (
                  females.map((name, idx) => (
                    <span
                      key={`${name}-${idx}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-100 group hover:border-rose-400 transition-all shadow-sm"
                    >
                      <span>🌸</span>
                      {name}
                      <button
                        type="button"
                        onClick={() => handleRemoveFemale(name)}
                        className="text-rose-400/70 hover:text-rose-200 ml-0.5 p-0.5"
                        title="Xóa"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* MALE LIST CARD */}
          <div className="rounded-3xl bg-zinc-900/70 border border-indigo-500/25 backdrop-blur-xl p-5 sm:p-6 flex flex-col justify-between shadow-xl">
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-indigo-500/15">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-indigo-300 flex items-center gap-1.5">
                      Dãy Quý Ông Ga Lăng 🎩
                    </h3>
                    <p className="text-xs text-zinc-400">Danh sách các bạn nam tham gia</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {males.length} bạn
                  </span>
                  <button
                    onClick={() => {
                      setBulkMode('male')
                      setBulkText(males.join('\n'))
                    }}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1 transition-all"
                    title="Nhập danh sách hàng loạt"
                  >
                    <ListPlus className="w-4 h-4 text-indigo-400" />
                  </button>
                  {males.length > 0 && (
                    <button
                      onClick={() => setMales([])}
                      disabled={isSpinning}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 text-xs transition-all"
                      title="Xoá hết danh sách nam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Single Name Add Form */}
              <form onSubmit={handleAddMale} className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={inputMale}
                  onChange={(e) => setInputMale(e.target.value)}
                  placeholder="Nhập tên bạn nam rồi ấn Enter..."
                  className="flex-1 bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputMale.trim()}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  Thêm
                </button>
              </form>

              {/* Tags / Name Chips */}
              <div className="mt-4 flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
                {males.length === 0 ? (
                  <div className="w-full py-8 text-center text-xs text-zinc-500 italic">
                    Chưa có bạn nam nào. Nhập tên ở trên hoặc nhấn "Mẫu 20/10".
                  </div>
                ) : (
                  males.map((name, idx) => (
                    <span
                      key={`${name}-${idx}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 group hover:border-indigo-500/40 transition-all"
                    >
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      {name}
                      <button
                        type="button"
                        onClick={() => handleRemoveMale(name)}
                        className="text-indigo-400/60 hover:text-indigo-300 ml-0.5 p-0.5"
                        title="Xóa"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* History of Matched Couples 20/10 */}
        {history.length > 0 && (
          <section className="rounded-3xl bg-zinc-900/50 border border-rose-500/20 backdrop-blur-xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-rose-500/15 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-zinc-100 flex items-center gap-1.5">
                  Lịch Sử Các ({history.length} cặp đã ghép) 💐
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyHistory}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-200 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Đã sao chép!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Sao chép danh sách 20/10
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử các cặp đôi đã ghép không?')) {
                      setHistory([])
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 text-xs font-medium transition-all"
                >
                  Xoá lịch sử
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-zinc-900/60 to-indigo-500/10 border border-rose-500/20 hover:border-rose-400/40 transition-all flex items-center justify-between shadow-sm group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-xs font-extrabold text-amber-300 shrink-0">
                      #{item.id}
                    </span>
                    <div className="text-xs truncate">
                      <div className="font-semibold text-zinc-200 flex items-center gap-1.5 truncate">
                        <span className="text-rose-300 font-bold">🌹 {item.female}</span>
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500 shrink-0" />
                        <span className="text-indigo-300 font-bold">⚡ {item.male}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                        <span className="font-mono text-cyan-400/80">
                          |{item.femaleBits}⟩ & |{item.maleBits}⟩
                        </span>
                        <span>•</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveCouple(item)}
                    className="p-2 rounded-xl bg-zinc-800/80 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 border border-zinc-700/50 hover:border-rose-500/30 transition-all shrink-0 ml-2"
                    title="Bỏ cặp đôi này (hoàn trả 2 bạn về danh sách quay)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 20/10 Greetings Modal */}
      {showWishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-gradient-to-b from-zinc-900 via-zinc-900 to-[#1b081c] border-2 border-rose-500/40 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
              <div className="flex items-center gap-2">
                <Flower2 className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-lg text-rose-200">
                  Lời Chúc Mừng 20/10 Ý Nghĩa
                </h3>
              </div>
              <button
                onClick={() => setShowWishModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-rose-200/80 leading-relaxed">
              Bấm vào bất kỳ lời chúc nào để sao chép nhanh và gửi tặng bạn bè, đồng nghiệp nữ nhé:
            </p>

            <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
              {WISHES_2010.map((wish, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    navigator.clipboard.writeText(wish)
                    alert('Đã sao chép lời chúc 20/10!')
                  }}
                  className="p-3.5 rounded-2xl bg-zinc-950/70 border border-rose-500/20 hover:border-rose-400 hover:bg-rose-950/20 cursor-pointer transition-all text-xs text-zinc-200 leading-relaxed flex items-start gap-2.5 group"
                >
                  <span className="text-rose-400 shrink-0 mt-0.5">💐</span>
                  <span className="flex-1">{wish}</span>
                  <Copy className="w-3.5 h-3.5 text-zinc-500 group-hover:text-rose-300 shrink-0 mt-1" />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-rose-500/20">
              <button
                onClick={() => setShowWishModal(false)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-500/20"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {bulkMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-zinc-100 flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-rose-400" />
                Nhập Danh Sách {bulkMode === 'female' ? 'Nữ Thần 20/10' : 'Nam'} Hàng Loạt
              </h3>
              <button
                onClick={() => setBulkMode(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              Nhập hoặc dán danh sách tên (mỗi tên trên một dòng hoặc cách nhau bởi dấu phẩy):
            </p>
            <textarea
              rows={8}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Lan Anh&#10;Minh Châu&#10;Thuỳ Trang..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-2xl p-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setBulkMode(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveBulk}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-500/20"
              >
                Lưu Danh Sách
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quantum Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Atom className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-lg text-zinc-100">
                  Cấu Hình Phần Cứng Lượng Tử
                </h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-zinc-300">
                Chọn nguồn sinh số ngẫu nhiên lượng tử thật:
              </span>

              {/* Option 1: ID Quantique */}
              <label
                onClick={() => setQuantumSource('hardware_qrng')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col gap-1.5 ${quantumSource === 'hardware_qrng'
                  ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-cyan-300">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    ID Quantique Quantis QRNG (Khuyên dùng)
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                    Phần Cứng Thật
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Thiết bị lượng tử vật lý thực tế đo nhiễu photon và dao động chân không lượng tử. Tốc độ tức thì (dưới 1s), không cần token, 100% ngẫu nhiên vật lý tuyệt đối.
                </p>
              </label>

              {/* Option 2: IBM Quantum QPU */}
              <label
                onClick={() => setQuantumSource('ibm_quantum')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col gap-1.5 ${quantumSource === 'ibm_quantum'
                  ? 'border-indigo-500 bg-indigo-950/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                  : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-indigo-300">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    IBM Quantum Hardware QPU (Qiskit Runtime)
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                    Siêu dẫn IBM
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Gửi mạch lượng tử Hadamard H^⊗n trực tiếp lên máy tính lượng tử IBM (QPU). Cần IBM API Token hợp lệ và không bị khóa.
                </p>
              </label>

              {/* Token Input for IBM */}
              {quantumSource === 'ibm_quantum' && (
                <div className="mt-2 p-3 rounded-2xl bg-zinc-950 border border-indigo-500/30 flex flex-col gap-2">
                  <label className="text-xs text-zinc-300 font-semibold flex items-center justify-between">
                    <span>IBM Quantum API Token:</span>
                    <a
                      href="https://quantum.ibm.com/account"
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:underline text-[11px]"
                    >
                      Lấy Token tại IBM Quantum
                    </a>
                  </label>
                  <input
                    type="password"
                    value={ibmToken}
                    onChange={(e) => handleSaveToken(e.target.value)}
                    placeholder="Dán API Token IBM Quantum của bạn vào đây..."
                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none"
                  />
                  <div className="flex items-start gap-1.5 text-[11px] text-amber-400/90 leading-tight">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      Lưu ý: Nếu tài khoản IBM Cloud bị khóa (Blocked account) hoặc ở hàng đợi lâu, bạn nên dùng chế độ ID Quantique ở trên để quay ngay lập tức.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowSettings(false)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-500/20"
              >
                Đã Xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASCII Quantum Circuit Modal */}
      {showCircuitModal && matchedCouple?.circuitAscii && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-lg text-zinc-100">
                  Mạch Lượng Tử Hadamard Thực Tế (Qiskit Circuit)
                </h3>
              </div>
              <button
                onClick={() => setShowCircuitModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Mỗi Qubit được đưa qua cổng Hadamard H để tạo trạng thái chồng chập lượng tử đều (1/√2)(|0⟩ + |1⟩). Quá trình đo kích hoạt sự suy giảm hàm sóng, tạo ra bit lượng tử hoàn toàn phi tiền định.
            </p>

            <pre className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-snug">
              {matchedCouple.circuitAscii}
            </pre>

            <div className="flex items-center justify-end">
              <button
                onClick={() => setShowCircuitModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
