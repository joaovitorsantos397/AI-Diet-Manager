import type { DailyLogEntry } from '../types/dailyLog'

const NUTRITION_DATA_PATTERN = /NUTRITION_DATA:\s*(\{[^\n]*\})/

type ExtractionResult = {
  cleanedReply: string
  entry: DailyLogEntry | null
}

export function extractNutritionData(reply: string): ExtractionResult {
  const match = reply.match(NUTRITION_DATA_PATTERN)

  if (!match) {
    return { cleanedReply: reply, entry: null }
  }

  const cleanedReply = reply.replace(match[0], '').trim()

  try {
    const parsed = JSON.parse(match[1])
    const entry: DailyLogEntry = {
      calories: Number(parsed.calories) || 0,
      proteinGrams: Number(parsed.proteinGrams) || 0,
      carbsGrams: Number(parsed.carbsGrams) || 0,
      fatGrams: Number(parsed.fatGrams) || 0,
    }
    return { cleanedReply, entry }
  } catch {
    return { cleanedReply, entry: null }
  }
}
