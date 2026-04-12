import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const __dirname = dirname(fileURLToPath(import.meta.url))

app.use(express.json())

// Create a Retell web call and return the access_token to the client
app.post('/api/create-call', async (req, res) => {
  const apiKey = process.env.RETELL_API_KEY
  const agentId = process.env.RETELL_AGENT_ID

  if (!apiKey || !agentId) {
    return res.status(500).json({
      error: 'RETELL_API_KEY and RETELL_AGENT_ID must be set in .env',
    })
  }

  try {
    const response = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agent_id: agentId }),
    })

    if (!response.ok) {
      const text = await response.text()
      return res.status(response.status).json({ error: text })
    }

    const data = await response.json()
    res.json(data) // contains access_token and call_id
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Serve built React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')))
  app.get('*', (_req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'))
  })
}

const PORT = process.env.NODE_ENV === 'production' ? (process.env.PORT || 3000) : 3001
app.listen(PORT, () => {
  console.log(`Darren server running on http://localhost:${PORT}`)
})
