import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { GoogleGenAI } from '@google/genai'

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.error('Missing GEMINI_API_KEY in .env')
  process.exit(1)
}

const ai = new GoogleGenAI({ apiKey })

const app = express()
app.use(cors())
// Default 100kb limit is too small for base64-encoded photos/audio.
app.use(express.json({ limit: '25mb' }))

app.post('/api/chat', async (req, res) => {
  const { contents, systemInstruction } = req.body

  if (!Array.isArray(contents) || contents.length === 0) {
    res.status(400).json({ error: 'contents is required' })
    return
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents,
      config: systemInstruction ? { systemInstruction } : undefined,
    })

    res.json({ reply: response.text })
  } catch (error) {
    console.error('Gemini request failed', error)
    res.status(502).json({ error: 'AI request failed' })
  }
})

const port = process.env.PORT || 3001

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
