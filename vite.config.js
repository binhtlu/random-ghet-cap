import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { spawn } from 'child_process'

function quantumApiPlugin() {
  const setupMiddleware = (server) => {
    server.middlewares.use('/api/quantum-pair', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        let body = ''
        req.on('data', chunk => {
          body += chunk
        })

        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}')
            const females = JSON.stringify(data.females || [])
            const males = JSON.stringify(data.males || [])

            const args = ['lucky_draw.py', '--pair', females, males]
            if (data.source) {
              args.push('--source', data.source)
            }
            if (data.ibmToken) {
              args.push('--token', data.ibmToken)
            }

            const py = spawn('python3', args)
            let stdout = ''
            let stderr = ''

            py.stdout.on('data', chunk => {
              stdout += chunk.toString()
            })
            py.stderr.on('data', chunk => {
              stderr += chunk.toString()
            })

            py.on('close', code => {
              res.setHeader('Content-Type', 'application/json')
              if (code !== 0) {
                res.statusCode = 500
                res.end(JSON.stringify({ error: stderr || 'Quantum calculation failed' }))
                return
              }
              try {
                const parsed = JSON.parse(stdout)
                res.end(JSON.stringify(parsed))
              } catch (e) {
                res.statusCode = 500
                res.end(JSON.stringify({ error: 'Failed to parse quantum output', raw: stdout }))
              }
            })
          } catch (err) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message }))
          }
        })
      })
  }

  return {
    name: 'quantum-api-plugin',
    configureServer: setupMiddleware,
    configurePreviewServer: setupMiddleware,
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    quantumApiPlugin(),
  ],
})
