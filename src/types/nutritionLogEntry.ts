import type { DailyLogEntry } from './dailyLog'

export type NutritionLogEntry = DailyLogEntry & {
  id: string
  timestamp: number
}
