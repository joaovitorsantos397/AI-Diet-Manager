import type { FeedbackLevel } from '../types/feedback'

const FEEDBACK_LEVEL_PATTERN = /FEEDBACK_LEVEL:\s*(green|yellow|red|none)/i

type FeedbackExtractionResult = {
  cleanedReply: string
  level: FeedbackLevel | null
}

export function extractFeedbackLevel(reply: string): FeedbackExtractionResult {
  const match = reply.match(FEEDBACK_LEVEL_PATTERN)

  if (!match) {
    return { cleanedReply: reply, level: null }
  }

  const cleanedReply = reply.replace(match[0], '').trim()
  const value = match[1].toLowerCase()
  const level = value === 'none' ? null : (value as FeedbackLevel)

  return { cleanedReply, level }
}
