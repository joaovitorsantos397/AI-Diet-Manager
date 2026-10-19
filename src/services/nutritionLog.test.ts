import { describe, expect, it } from 'vitest'
import { getTotalsForDay } from './nutritionLog'
import type { NutritionLogEntry } from '../types/nutritionLogEntry'

function entry(
  overrides: Partial<NutritionLogEntry> & { timestamp: number },
): NutritionLogEntry {
  return {
    id: `id-${overrides.timestamp}`,
    calories: 100,
    proteinGrams: 10,
    carbsGrams: 10,
    fatGrams: 10,
    description: 'item',
    mealTime: '12:00',
    mealGroupId: `id-${overrides.timestamp}`,
    ...overrides,
  }
}

describe('getTotalsForDay', () => {
  it('sums only the entries from the given day', () => {
    const today = new Date(2026, 9, 19, 12)
    const log: NutritionLogEntry[] = [
      entry({ timestamp: new Date(2026, 9, 19, 8).getTime(), calories: 300, proteinGrams: 20 }),
      entry({ timestamp: new Date(2026, 9, 19, 18).getTime(), calories: 500, proteinGrams: 30 }),
      entry({ timestamp: new Date(2026, 9, 18, 8).getTime(), calories: 999, proteinGrams: 99 }),
    ]

    expect(getTotalsForDay(log, today)).toEqual({
      calories: 800,
      proteinGrams: 50,
      carbsGrams: 20,
      fatGrams: 20,
    })
  })

  it('returns zeroed totals when there are no entries for that day', () => {
    const today = new Date(2026, 9, 19)
    expect(getTotalsForDay([], today)).toEqual({
      calories: 0,
      proteinGrams: 0,
      carbsGrams: 0,
      fatGrams: 0,
    })
  })

  it('treats entries near midnight as different days', () => {
    const log: NutritionLogEntry[] = [
      entry({ timestamp: new Date(2026, 9, 19, 23, 59).getTime(), calories: 100 }),
      entry({ timestamp: new Date(2026, 9, 20, 0, 1).getTime(), calories: 200 }),
    ]
    expect(getTotalsForDay(log, new Date(2026, 9, 19)).calories).toBe(100)
    expect(getTotalsForDay(log, new Date(2026, 9, 20)).calories).toBe(200)
  })
})
