import type { ChatMessage } from '../types/message'

type SendChatMessageParams = {
  messages: ChatMessage[]
  systemInstruction: string
}

function formatClockTime(timestamp: number): string {
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function messageToParts(message: ChatMessage) {
  // A leading clock-time part gives the model real chronological context
  // for every turn — otherwise it has no way to reason about elapsed time
  // between messages or when a meal actually happened.
  const timePart = { text: `[${formatClockTime(message.timestamp)}]` }
  const contentPart =
    message.type === 'text'
      ? { text: message.content }
      : { inlineData: { mimeType: message.mimeType, data: message.base64Data } }

  return [timePart, contentPart]
}

export async function sendChatMessage({
  messages,
  systemInstruction,
}: SendChatMessageParams): Promise<string> {
  const contents = messages.map((message) => ({
    role: message.role === 'user' ? 'user' : 'model',
    parts: messageToParts(message),
  }))

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents, systemInstruction }),
  })

  if (!response.ok) {
    throw new Error('AI request failed')
  }

  const data: { reply: string } = await response.json()
  return data.reply
}
