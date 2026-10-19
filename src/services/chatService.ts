import type { ChatMessage } from '../types/message'

type SendChatMessageParams = {
  messages: ChatMessage[]
  systemInstruction: string
}

export type ChatFunctionCall = {
  name: string
  args?: Record<string, unknown>
}

export type ChatResponse = {
  text: string
  functionCalls: ChatFunctionCall[]
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
}: SendChatMessageParams): Promise<ChatResponse> {
  // Synthetic, app-generated bubbles (a no-text fallback, a recalculated-
  // targets notice) never actually came from the model — sending them
  // back as its own past turns would let it pattern-match its future
  // replies against text it never wrote, which is exactly backwards.
  const historyMessages = messages.filter(
    (message) => !(message.type === 'text' && message.isSynthetic),
  )
  const contents = historyMessages.map((message) => ({
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

  const data: ChatResponse = await response.json()
  return { text: data.text ?? '', functionCalls: data.functionCalls ?? [] }
}
