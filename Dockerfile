# ==========================================
# 1. Base stage: Node.js 22 + Python 3 + Qiskit
# ==========================================
FROM node:22-bookworm-slim AS base

WORKDIR /app

# Cài đặt Python 3, pip, venv và curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    curl \
 && rm -rf /var/lib/apt/lists/*

# Thiết lập Python virtual environment và cài thư viện lượng tử (qiskit)
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt


# ==========================================
# 2. Builder stage: Build React Frontend
# ==========================================
FROM base AS builder

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ==========================================
# 3. Production Runner stage
# ==========================================
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Chỉ cài dependencies phục vụ production (express, cors, v.v.)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy mã nguồn frontend đã build và server/python scripts
COPY --from=builder /app/dist ./dist
COPY server.js lucky_draw.py ./

EXPOSE 3000

# Khởi chạy Express server điều phối frontend + thuật toán lượng tử
CMD ["node", "server.js"]
