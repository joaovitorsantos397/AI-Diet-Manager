import type { DailyLogEntry } from '../types/dailyLog'

const NUTRITION_DATA_PATTERN = /NUTRITION_DATA:\s*(\{[^\n]*\})/

export type NutritionDataEntry = DailyLogEntry & {
  description: string
  mealTime: string
}

type ExtractionResult = {
  cleanedReply: string
  entry: NutritionDataEntry | null
}

export function extractNutritionData(reply: string): ExtractionResult {
  const match = reply.match(NUTRITION_DATA_PATTERN)

  if (!match) {
    return { cleanedReply: reply, entry: null }
  }

  const cleanedReply = reply.replace(match[0], '').trim()

  try {
    const parsed = JSON.parse(match[1])
    const entry: NutritionDataEntry = {
      calories: Number(parsed.calories) || 0,
      proteinGrams: Number(parsed.proteinGrams) || 0,
      carbsGrams: Number(parsed.carbsGrams) || 0,
      fatGrams: Number(parsed.fatGrams) || 0,
      description:
        typeof parsed.description === 'string' ? parsed.description : '',
      mealTime: typeof parsed.mealTime === 'string' ? parsed.mealTime : '',
    }
    return { cleanedReply, entry }
  } catch {
    return { cleanedReply, entry: null }
  }
}
