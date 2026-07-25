import type { FeedbackLevel } from './feedback'

export type ChatMessage =
  | {
      id: string
      role: 'user' | 'coach'
      type: 'text'
      content: string
      timestamp: number
      feedbackLevel?: FeedbackLevel
      isError?: boolean
    }
  | {
      id: string
      role: 'user' | 'coach'
      type: 'image'
      imageUrl: string
      base64Data: string
      mimeType: string
      timestamp: number
    }
  | {
      id: string
      role: 'user' | 'coach'
      type: 'audio'
      audioUrl: string
      base64Data: string
      mimeType: string
      timestamp: number
    }
