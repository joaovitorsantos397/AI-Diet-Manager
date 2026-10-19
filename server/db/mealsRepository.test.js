import { beforeEach, describe, expect, it } from 'vitest'
import { openDatabase } from './connection.js'
import {
  addMeal,
  listByDate,
  totalsByDate,
  totalsByRange,
  removeLastGroup,
  clearDay,
} from './mealsRepository.js'

let db

beforeEach(() => {
  db = openDatabase(':memory:')
})

function rice(overrides = {}) {
  return { name: 'Rice', kcal: 200, proteinG: 4, carbsG: 45, fatG: 0, ...overrides }
}

describe('addMeal + listByDate', () => {
  it('inserts a meal group with its items and lists it back', () => {
    addMeal(db, {
      profileId: 'default',
      eatenAt: '2026-10-19T12:00:00Z',
      description: 'Lunch',
      items: [rice(), rice({ name: 'Chicken', kcal: 250, proteinG: 40, carbsG: 0, fatG: 8 })],
    })

    const result = listByDate(db, { profileId: 'default', date: '2026-10-19' })
    expect(result).toHaveLength(1)
    expect(result[0].description).toBe('Lunch')
    expect(result[0].items).toHaveLength(2)
    expect(result[0].items.map((i) => i.name)).toEqual(['Rice', 'Chicken'])
  })

  it('rolls back the whole transaction if one item fails to insert', () => {
    expect(() =>
      addMeal(db, {
        profileId: 'default',
        eatenAt: '2026-10-19T12:00:00Z',
        items: [rice(), { name: 'Bad item', kcal: null, proteinG: 1, carbsG: 1, fatG: 1 }],
      }),
    ).toThrow()

    const result = listByDate(db, { profileId: 'default', date: '2026-10-19' })
    expect(result).toHaveLength(0)
  })
})

describe('totalsByDate', () => {
  it('sums kcal/macros across every item logged that day', () => {
    addMeal(db, {
      profileId: 'default',
      eatenAt: '2026-10-19T08:00:00Z',
      items: [rice({ kcal: 300, proteinG: 20, carbsG: 50, fatG: 5 })],
    })
    addMeal(db, {
      profileId: 'default',
      eatenAt: '2026-10-19T18:00:00Z',
      items: [rice({ kcal: 500, proteinG: 30, carbsG: 60, fatG: 10 })],
    })

    const totals = totalsByDate(db, { profileId: 'default', date: '2026-10-19' })
    expect(totals.kcal).toBe(800)
    expect(totals.protein_g).toBe(50)
  })

  it('returns zeroed totals for a day with no meals', () => {
    const totals = totalsByDate(db, { profileId: 'default', date: '2026-01-01' })
    expect(totals).toEqual({ kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 })
  })

  it('treats entries near midnight as different days', () => {
    addMeal(db, {
      profileId: 'default',
      eatenAt: '2026-10-19T23:59:00Z',
      items: [rice({ kcal: 100 })],
    })
    addMeal(db, {
      profileId: 'default',
      eatenAt: '2026-10-20T00:01:00Z',
      items: [rice({ kcal: 200 })],
    })

    expect(totalsByDate(db, { profileId: 'default', date: '2026-10-19' }).kcal).toBe(100)
    expect(totalsByDate(db, { profileId: 'default', date: '2026-10-20' }).kcal).toBe(200)
  })
})

describe('totalsByRange', () => {
  it('returns one row per day within the range', () => {
    addMeal(db, { profileId: 'default', eatenAt: '2026-10-18T08:00:00Z', items: [rice({ kcal: 100 })] })
    addMeal(db, { profileId: 'default', eatenAt: '2026-10-19T08:00:00Z', items: [rice({ kcal: 200 })] })
    addMeal(db, { profileId: 'default', eatenAt: '2026-10-25T08:00:00Z', items: [rice({ kcal: 999 })] })

    const rows = totalsByRange(db, { profileId: 'default', from: '2026-10-17', to: '2026-10-20' })
    expect(rows).toEqual([
      { day: '2026-10-18', kcal: 100, protein_g: 4, carbs_g: 45, fat_g: 0 },
      { day: '2026-10-19', kcal: 200, protein_g: 4, carbs_g: 45, fat_g: 0 },
    ])
  })
})

describe('removeLastGroup', () => {
  it('removes the most recently eaten group, items included', () => {
    addMeal(db, { profileId: 'default', eatenAt: '2026-10-19T08:00:00Z', items: [rice()] })
    addMeal(db, {
      profileId: 'default',
      eatenAt: '2026-10-19T18:00:00Z',
      items: [rice(), rice({ name: 'Beans' })],
    })

    removeLastGroup(db, { profileId: 'default' })

    const remaining = listByDate(db, { profileId: 'default', date: '2026-10-19' })
    expect(remaining).toHaveLength(1)
    expect(remaining[0].eaten_at).toBe('2026-10-19T08:00:00Z')

    const orphanItems = db.prepare('SELECT * FROM meal_items').all()
    expect(orphanItems).toHaveLength(1)
  })

  it('returns null when the profile has nothing logged', () => {
    expect(removeLastGroup(db, { profileId: 'default' })).toBeNull()
  })
})

describe('clearDay', () => {
  it('removes every group logged on that day, items included, keeping other days', () => {
    addMeal(db, { profileId: 'default', eatenAt: '2026-10-19T08:00:00Z', items: [rice()] })
    addMeal(db, { profileId: 'default', eatenAt: '2026-10-19T18:00:00Z', items: [rice()] })
    addMeal(db, { profileId: 'default', eatenAt: '2026-10-18T08:00:00Z', items: [rice()] })

    const result = clearDay(db, { profileId: 'default', date: '2026-10-19' })
    expect(result.removedGroups).toBe(2)
    expect(listByDate(db, { profileId: 'default', date: '2026-10-19' })).toHaveLength(0)
    expect(listByDate(db, { profileId: 'default', date: '2026-10-18' })).toHaveLength(1)
    expect(db.prepare('SELECT * FROM meal_items').all()).toHaveLength(1)
  })
})

describe('profile isolation', () => {
  it('never mixes data between two different profile_id values', () => {
    addMeal(db, { profileId: 'alice', eatenAt: '2026-10-19T08:00:00Z', items: [rice({ kcal: 111 })] })
    addMeal(db, { profileId: 'bob', eatenAt: '2026-10-19T08:00:00Z', items: [rice({ kcal: 222 })] })

    expect(totalsByDate(db, { profileId: 'alice', date: '2026-10-19' }).kcal).toBe(111)
    expect(totalsByDate(db, { profileId: 'bob', date: '2026-10-19' }).kcal).toBe(222)
    expect(listByDate(db, { profileId: 'alice', date: '2026-10-19' })).toHaveLength(1)

    removeLastGroup(db, { profileId: 'alice' })
    expect(listByDate(db, { profileId: 'alice', date: '2026-10-19' })).toHaveLength(0)
    expect(listByDate(db, { profileId: 'bob', date: '2026-10-19' })).toHaveLength(1)
  })
})
