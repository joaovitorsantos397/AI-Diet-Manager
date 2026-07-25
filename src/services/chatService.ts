import type { ChatMessage } from '../types/message'

type SendChatMessageParams = {
  messages: ChatMessage[]
  systemInstruction: string
}

function messageToPart(message: ChatMessage) {
  if (message.type === 'text') {
    return { text: message.content }
  }
  return {
    inlineData: { mimeType: message.mimeType, data: message.base64Data },
  }
}

export async function sendChatMessage({
  messages,
  systemInstruction,
}: SendChatMessageParams): Promise<string> {
  const contents = messages.map((message) => ({
    role: message.role === 'user' ? 'user' : 'model',
    parts: [messageToPart(message)],
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
