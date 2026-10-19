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
  // Shared by every entry logged from the same model turn, so a meal
  // reported as several log_meal calls (one per food item) can still be
  // removed or audited as the single meal the user actually reported.
  mealGroupId: string
}
