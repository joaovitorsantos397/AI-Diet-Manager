import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { GoogleGenAI, Type } from '@google/genai'

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

// Structured actions the coach can take, declared as real function-calling
// tools instead of a text convention ("add a line NUTRITION_DATA:{...}")
// the model had to remember to write correctly on its own. The API
// enforces this schema server-side, so a logged meal either arrives as a
// valid, typed call or doesn't happen at all — it can no longer silently
// vanish because of a malformed JSON line or a skipped marker buried in a
// long system prompt, which was a real, repeated bug with the old
// approach.
const TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'log_meal',
        description:
          'Log a specific food or meal the user actually ate. Call this every time new food is confirmed, never for a schedule, a question, or a recap of already-logged food.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.NUMBER },
            proteinGrams: { type: Type.NUMBER },
            carbsGrams: { type: Type.NUMBER },
            fatGrams: { type: Type.NUMBER },
            description: {
              type: Type.STRING,
              description: 'Short label, 3-6 words, e.g. "Aveia, pasta de amendoim, leite, ovos".',
            },
            mealTime: {
              type: Type.STRING,
              description: '24h clock time the food was eaten, "HH:MM".',
            },
            date: {
              type: Type.STRING,
              nullable: true,
              description:
                'YYYY-MM-DD, ONLY set when the food was eaten on a day other than today (e.g. "ontem"). Null/omit for anything eaten today.',
            },
          },
          required: [
            'calories',
            'proteinGrams',
            'carbsGrams',
            'fatGrams',
            'description',
            'mealTime',
          ],
        },
      },
      {
        name: 'remove_last_meal',
        description:
          'Undo the WHOLE most recently logged meal, including every item if it was logged as several log_meal calls. Use this only when the user wants that entire meal gone, not to fix one wrong value in it — for a single-item fix use remove_meal_by_number instead. Never use this to add a meal that was simply never logged — that is log_meal, not this.',
      },
      {
        name: 'remove_meal_by_number',
        description:
          "Undo a specific earlier meal (not necessarily the most recent one) by its #N position in 'Today's logged meals', when the user points out an earlier entry was wrong. Always use the #N number, never the mealTime — two entries can share the same mealTime (e.g. several items logged from one message), so mealTime alone cannot uniquely identify which one to remove.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            entryNumber: {
              type: Type.NUMBER,
              description: 'The #N shown next to the entry in "Today\'s logged meals" (1-indexed).',
            },
          },
          required: ['entryNumber'],
        },
      },
      {
        name: 'clear_today_log',
        description:
          "Wipe every meal logged today in one shot. Use this when the user asks to reset/clear/remove everything logged today — never enumerate each entry with separate remove_meal_by_number calls, that's unreliable and easy to miss one.",
      },
      {
        name: 'log_weight',
        description:
          'Log a new weigh-in or bioimpedance reading the user just reported.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            weightKg: { type: Type.NUMBER },
            bodyFatPercentage: { type: Type.NUMBER, nullable: true },
            basalMetabolicRate: {
              type: Type.NUMBER,
              nullable: true,
              description:
                'Only set if the bioimpedance reading itself displayed a measured BMR figure — never estimate this yourself.',
            },
          },
          required: ['weightKg'],
        },
      },
      {
        name: 'change_goal',
        description:
          "Update the user's diet goal after they explicitly ask to change it (not just a passing wish).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            goal: {
              type: Type.STRING,
              format: 'enum',
              enum: ['lose', 'maintain', 'lean_gain', 'aggressive_gain'],
            },
          },
          required: ['goal'],
        },
      },
      {
        name: 'set_bandejao_user',
        description:
          "Record whether the user eats at Unicamp's bandejão (RU), once they've given a clear yes/no answer to that question.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            isBandejaoUser: { type: Type.BOOLEAN },
          },
          required: ['isBandejaoUser'],
        },
      },
    ],
  },
]

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/chat', async (req, res) => {
  const { contents, systemInstruction } = req.body

  if (!Array.isArray(contents) || contents.length === 0) {
    res.status(400).json({ error: 'contents is required' })
    return
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents,
      config: {
        ...(systemInstruction ? { systemInstruction } : {}),
        tools: TOOLS,
      },
    })

    res.json({
      text: response.text ?? '',
      functionCalls: response.functionCalls ?? [],
    })
  } catch (error) {
    console.error('Gemini request failed', error)
    res.status(502).json({ error: 'AI request failed' })
  }
})

const port = process.env.PORT || 3001

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
