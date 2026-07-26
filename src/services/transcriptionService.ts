import type { Language } from '../types/language'

type TranscribeAudioParams = {
  base64Data: string
  mimeType: string
  language: Language
}

export async function transcribeAudio({
  base64Data,
  mimeType,
  language,
}: TranscribeAudioParams): Promise<string> {
  const languageName = language === 'pt' ? 'Portuguese' : 'English'
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `Transcribe this audio literally in ${languageName}. Reply with only the transcript text, nothing else — no quotes, no commentary, no translation.`,
        },
        { inlineData: { mimeType, data: base64Data } },
      ],
    },
  ]

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  })

  if (!response.ok) {
    throw new Error('Transcription request failed')
  }

  const data: { reply: string } = await response.json()
  return data.reply.trim()
}
