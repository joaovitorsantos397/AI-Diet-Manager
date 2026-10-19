import { describe, expect, it } from 'vitest'
import { applyMealCorrections, dedupeMealEntries } from './mealCorrections'
import type { NutritionLogEntry } from '../types/nutritionLogEntry'

const TODAY = new Date(2026, 9, 19, 12, 0)

function entry(
  overrides: Partial<NutritionLogEntry> & { hour: number },
): NutritionLogEntry {
  const { hour, ...rest } = overrides
  return {
    id: rest.id ?? `id-${hour}-${Math.random()}`,
    timestamp: new Date(2026, 9, 19, hour).getTime(),
    calories: 100,
    proteinGrams: 10,
    carbsGrams: 10,
    fatGrams: 10,
    description: 'item',
    mealTime: `${hour}:00`,
    mealGroupId: 'group-default',
    ...rest,
  }
}

describe('dedupeMealEntries', () => {
  it('collapses repeated log_meal calls with identical values into one', () => {
    const a = entry({ hour: 8, description: 'Oats', mealGroupId: 'g1' })
    const duplicate = { ...a, id: 'other-id' }
    const result = dedupeMealEntries([a, duplicate])
    expect(result).toHaveLength(1)
  })

  it('keeps entries whose values differ', () => {
    const a = entry({ hour: 8, description: 'Oats', mealGroupId: 'g1' })
    const b = entry({ hour: 8, description: 'Milk', mealGroupId: 'g1' })
    expect(dedupeMealEntries([a, b])).toHaveLength(2)
  })
})

describe('applyMealCorrections', () => {
  it('removes a specific earlier entry by its #N position (today, timestamp order)', () => {
    const e1 = entry({ hour: 8, mealGroupId: 'g1' })
    const e2 = entry({ hour: 12, mealGroupId: 'g2' })
    const e3 = entry({ hour: 18, mealGroupId: 'g3' })
    const result = applyMealCorrections(
      [e1, e2, e3],
      {
        shouldClearToday: false,
        shouldRemoveLast: false,
        removeMealNumbers: [2],
        newMealEntries: [],
      },
      TODAY,
    )
    expect(result.map((e) => e.id)).toEqual([e1.id, e3.id])
  })

  it('removes the whole last meal group, not just its last item', () => {
    const earlierMeal = entry({ hour: 8, mealGroupId: 'breakfast' })
    const lastMealItem1 = entry({
      hour: 18,
      mealGroupId: 'dinner',
      description: 'Rice',
      proteinGrams: 5,
    })
    const lastMealItem2 = entry({
      hour: 18,
      mealGroupId: 'dinner',
      description: 'Chicken',
      proteinGrams: 40,
    })
    const result = applyMealCorrections(
      [earlierMeal, lastMealItem1, lastMealItem2],
      {
        shouldClearToday: false,
        shouldRemoveLast: true,
        removeMealNumbers: [],
        newMealEntries: [],
      },
      TODAY,
    )
    expect(result.map((e) => e.id)).toEqual([earlierMeal.id])
  })

  it('clears every entry logged today, keeping entries from other days', () => {
    const today = entry({ hour: 8, mealGroupId: 'g1' })
    const yesterday = entry({
      hour: 8,
      mealGroupId: 'g0',
      timestamp: new Date(2026, 9, 18, 8).getTime(),
    })
    const result = applyMealCorrections(
      [yesterday, today],
      {
        shouldClearToday: true,
        shouldRemoveLast: false,
        removeMealNumbers: [],
        newMealEntries: [],
      },
      TODAY,
    )
    expect(result.map((e) => e.id)).toEqual([yesterday.id])
  })

  it('removes the last meal and logs a new one in the same turn', () => {
    const earlierMeal = entry({ hour: 8, mealGroupId: 'breakfast' })
    const wrongDinner = entry({ hour: 18, mealGroupId: 'dinner-wrong' })
    const correctedDinner = entry({
      hour: 18,
      mealGroupId: 'dinner-fixed',
      description: 'Chicken (corrected)',
    })
    const result = applyMealCorrections(
      [earlierMeal, wrongDinner],
      {
        shouldClearToday: false,
        shouldRemoveLast: true,
        removeMealNumbers: [],
        newMealEntries: [correctedDinner],
      },
      TODAY,
    )
    expect(result.map((e) => e.id)).toEqual([earlierMeal.id, correctedDinner.id])
  })

  it('resolves #N and "last" against the pre-turn state, ignoring entries added in the same turn', () => {
    const e1 = entry({ hour: 8, mealGroupId: 'g1' })
    const e2 = entry({ hour: 12, mealGroupId: 'g2' })
    const newEntry = entry({ hour: 20, mealGroupId: 'g-new', description: 'New snack' })
    // If resolution used post-append state, "last" would wrongly target
    // newEntry instead of e2.
    const result = applyMealCorrections(
      [e1, e2],
      {
        shouldClearToday: false,
        shouldRemoveLast: true,
        removeMealNumbers: [],
        newMealEntries: [newEntry],
      },
      TODAY,
    )
    expect(result.map((e) => e.id)).toEqual([e1.id, newEntry.id])
  })
})
