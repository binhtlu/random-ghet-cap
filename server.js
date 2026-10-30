import express from 'express'
import cors from 'cors'
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Hỗ trợ reverse proxy (Traefik/Nginx) nhận diện đúng HTTPS và client IP
app.set('trust proxy', 1)

app.use(cors())
app.use(express.json())

// API: Ghép cặp ngẫu nhiên lượng tử (Nữ + Nam)
app.post('/api/quantum-pair', (req, res) => {
  const { females = [], males = [], source, ibmToken } = req.body || {}

  const args = [
    path.join(__dirname, 'lucky_draw.py'),
    '--pair',
    JSON.stringify(females),
    JSON.stringify(males)
  ]

  if (source) {
    args.push('--source', source)
  }
  if (ibmToken) {
    args.push('--token', ibmToken)
  }

  const py = spawn('python3', args)
  let stdout = ''
  let stderr = ''

  py.stdout.on('data', (chunk) => {
    stdout += chunk.toString()
  })

  py.stderr.on('data', (chunk) => {
    stderr += chunk.toString()
  })

  py.on('close', (code) => {
    res.setHeader('Content-Type', 'application/json')
    if (code !== 0) {
      res.status(500).json({ error: stderr || 'Quantum calculation failed' })
      return
    }
    try {
      const parsed = JSON.parse(stdout)
      res.json(parsed)
    } catch (e) {
      res.status(500).json({ error: 'Failed to parse quantum output', raw: stdout })
    }
  })
})

// API: Quay đơn danh sách (nếu dùng)
app.post('/api/draw', (req, res) => {
  const { items = [], source, ibmToken } = req.body || {}

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Danh sách người tham gia không hợp lệ.' })
  }

  const args = [path.join(__dirname, 'lucky_draw.py'), JSON.stringify(items)]

  if (source) {
    args.push('--source', source)
  }
  if (ibmToken) {
    args.push('--token', ibmToken)
  }

  const py = spawn('python3', args)
  let stdout = ''
  let stderr = ''

  py.stdout.on('data', (chunk) => {
    stdout += chunk.toString()
  })

  py.stderr.on('data', (chunk) => {
    stderr += chunk.toString()
  })

  py.on('close', (code) => {
    res.setHeader('Content-Type', 'application/json')
    if (code !== 0) {
      res.status(500).json({ error: stderr || 'Quantum calculation failed' })
      return
    }
    try {
      const parsed = JSON.parse(stdout)
      res.json(parsed)
    } catch (e) {
      res.status(500).json({ error: 'Failed to parse quantum output', raw: stdout })
    }
  })
})

// Phục vụ frontend tĩnh đã build (dist)
const distPath = path.join(__dirname, 'dist')
app.use(express.static(distPath))

// SPA fallback cho mọi routing client-side (tương thích Express 4 & 5)
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    return next()
  }
  if (req.path.startsWith('/api/')) {
    return next()
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Not Found')
    }
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Quantum App running on http://0.0.0.0:${PORT}`)
})
