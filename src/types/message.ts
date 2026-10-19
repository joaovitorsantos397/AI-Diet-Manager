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
      // App-generated notices (e.g. the recalculated-targets messages, or
      // the no-text fallback) — never sent back to the model as history,
      // so it doesn't start pattern-matching its own "voice" against
      // text it never actually wrote.
      isSynthetic?: boolean
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
