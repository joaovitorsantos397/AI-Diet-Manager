import type { DailyLogEntry } from '../types/dailyLog'
import type { NutritionLogEntry } from '../types/nutritionLogEntry'
import type { FeedbackLevel } from '../types/feedback'
import { isSameDay } from '../utils/date'

const EMPTY_TOTALS: DailyLogEntry = {
  calories: 0,
  proteinGrams: 0,
  carbsGrams: 0,
  fatGrams: 0,
}

export function getTotalsForDay(
  log: NutritionLogEntry[],
  date: Date = new Date(),
): DailyLogEntry {
  return log
    .filter((entry) => isSameDay(new Date(entry.timestamp), date))
    .reduce(
      (totals, entry) => ({
        calories: totals.calories + entry.calories,
        proteinGrams: totals.proteinGrams + entry.proteinGrams,
        carbsGrams: totals.carbsGrams + entry.carbsGrams,
        fatGrams: totals.fatGrams + entry.fatGrams,
      }),
      EMPTY_TOTALS,
    )
}

export type DailySummary = {
  date: Date
  totals: DailyLogEntry
  hasEntries: boolean
  // null = no data yet, or the day is still in progress (not fair to
  // judge adherence before the day is over).
  status: FeedbackLevel | null
}

export function classifyStatus(
  consumed: number,
  target: number,
): FeedbackLevel {
  if (target <= 0) {
    return 'yellow'
  }
  const ratio = consumed / target
  if (ratio >= 0.85 && ratio <= 1.15) {
    return 'green'
  }
  if ((ratio >= 0.7 && ratio < 0.85) || (ratio > 1.15 && ratio <= 1.3)) {
    return 'yellow'
  }
  return 'red'
}

export function getDailySeries(
  log: NutritionLogEntry[],
  targetCalories: number,
  days: number,
): DailySummary[] {
  const today = new Date()
  const series: DailySummary[] = []

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)

    const totals = getTotalsForDay(log, date)
    const hasEntries = log.some((entry) =>
      isSameDay(new Date(entry.timestamp), date),
    )
    const isToday = isSameDay(date, today)
    const status =
      !hasEntries || isToday
        ? null
        : classifyStatus(totals.calories, targetCalories)

    series.push({ date, totals, hasEntries, status })
  }

  return series
}

// A day counts toward the streak only when both calories and protein
// landed "green" — today is never counted since it's still in progress.
const MAX_STREAK_LOOKBACK_DAYS = 365

export function getAdherenceStreakDays(
  log: NutritionLogEntry[],
  targetCalories: number,
  targetProtein: number,
): number {
  const cursor = new Date()
  cursor.setDate(cursor.getDate() - 1)

  let streak = 0

  for (let i = 0; i < MAX_STREAK_LOOKBACK_DAYS; i += 1) {
    const hasEntries = log.some((entry) =>
      isSameDay(new Date(entry.timestamp), cursor),
    )
    if (!hasEntries) {
      break
    }

    const totals = getTotalsForDay(log, cursor)
    const caloriesStatus = classifyStatus(totals.calories, targetCalories)
    const proteinStatus = classifyStatus(totals.proteinGrams, targetProtein)

    if (caloriesStatus !== 'green' || proteinStatus !== 'green') {
      break
    }

    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}
