import type { DailyLogEntry } from './dailyLog'

export type NutritionLogEntry = DailyLogEntry & {
  id: string
  timestamp: number
  // Short human-readable label (e.g. "Oats, peanut butter, milk, eggs")
  // and the real clock time (24h "HH:MM") the food was actually eaten —
  // both filled in by the model, used to let the user audit/correct a
  // specific past entry instead of only the most recent one.
  description: string
  mealTime: string
}
