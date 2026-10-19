import type { NutritionLogEntry } from '../types/nutritionLogEntry'
import { isSameDay } from '../utils/date'

export type MealCorrectionInput = {
  shouldClearToday: boolean
  shouldRemoveLast: boolean
  removeMealNumbers: number[]
  newMealEntries: NutritionLogEntry[]
}

// The model is instructed to call log_meal once per distinct item, but a
// single response calling it more than once for the exact same item
// (identical values) is never intentional — collapse those down to one
// entry instead of trusting prompt compliance alone for something this
// consequential.
export function dedupeMealEntries(
  entries: NutritionLogEntry[],
): NutritionLogEntry[] {
  const seen = new Set<string>()
  return entries.filter((entry) => {
    const signature = [
      entry.calories,
      entry.proteinGrams,
      entry.carbsGrams,
      entry.fatGrams,
      entry.description,
      entry.mealTime,
    ].join('|')
    if (seen.has(signature)) {
      return false
    }
    seen.add(signature)
    return true
  })
}

export function applyMealCorrections(
  current: NutritionLogEntry[],
  { shouldClearToday, shouldRemoveLast, removeMealNumbers, newMealEntries }: MealCorrectionInput,
  now: Date = new Date(),
): NutritionLogEntry[] {
  // Resolved against the pre-turn state, in the same timestamp order the
  // model was shown as "Today's logged meals" #N — before any removal or
  // addition from this same turn changes it.
  const todaysEntries = current
    .filter((entry) => isSameDay(new Date(entry.timestamp), now))
    .sort((a, b) => a.timestamp - b.timestamp)
  const todaysEntryIds = todaysEntries.map((entry) => entry.id)

  const idsToRemoveByNumber = new Set(
    removeMealNumbers
      .map((n) => todaysEntryIds[n - 1])
      .filter((id): id is string => id !== undefined),
  )

  // "Last meal" means every entry sharing the most-recently-logged
  // mealGroupId, not just the single most recent entry — a meal reported
  // as several log_meal calls (one per food item) must come out as a
  // whole, or the day's totals only partially reflect the removal.
  const lastGroupId = todaysEntries.at(-1)?.mealGroupId
  const idsToRemoveAsLastMeal = new Set(
    shouldRemoveLast && lastGroupId
      ? todaysEntries
          .filter((entry) => entry.mealGroupId === lastGroupId)
          .map((entry) => entry.id)
      : [],
  )

  let updated = shouldClearToday
    ? current.filter((entry) => !isSameDay(new Date(entry.timestamp), now))
    : current
  updated = updated.filter(
    (entry) =>
      !idsToRemoveAsLastMeal.has(entry.id) && !idsToRemoveByNumber.has(entry.id),
  )
  return [...updated, ...dedupeMealEntries(newMealEntries)]
}
