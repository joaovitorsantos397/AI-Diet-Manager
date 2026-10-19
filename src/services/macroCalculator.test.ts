import { describe, expect, it } from 'vitest'
import { calculateMacros } from './macroCalculator'
import type { UserProfile } from '../types/userProfile'

const baseProfile: UserProfile = {
  name: 'Test',
  goal: 'maintain',
  sex: 'male',
  age: 30,
  height: 180,
  weight: 80,
  bodyFatPercentage: null,
  basalMetabolicRate: null,
  activityLevel: 'sedentary',
  trainingRoutine: 'fixed',
  trainingSchedule: null,
  hormoneUse: 'no',
}

describe('calculateMacros', () => {
  it('derives protein, fat, carbs, fiber and water from calories (maintain goal)', () => {
    const macros = calculateMacros(baseProfile, 2136)
    expect(macros.proteinGrams).toBe(144) // 1.8 g/kg * 80kg
    expect(macros.fatGrams).toBe(59) // 25% of 2136 kcal / 9
    expect(macros.saturatedFatCapGrams).toBe(17) // 7% of 2136 kcal / 9
    expect(macros.carbsGrams).toBe(257) // remaining kcal / 4
    expect(macros.fiberGrams).toBe(30) // 14g per 1000 kcal
    expect(macros.waterMl).toBe(3100) // 35ml/kg + fiber water, no bonuses
  })

  it('adds a high-protein water bonus once g/kg crosses the threshold', () => {
    const profile: UserProfile = { ...baseProfile, goal: 'aggressive_gain' }
    const macros = calculateMacros(profile, 2636)
    expect(macros.proteinGrams).toBe(200) // 2.5 g/kg >= 2.2 threshold
    expect(macros.waterMl).toBe(3670) // base + 500ml high-protein bonus
  })

  it('adds the hormone-use protein and water bonuses', () => {
    const profile: UserProfile = { ...baseProfile, hormoneUse: 'yes' }
    const macros = calculateMacros(profile, 2243)
    expect(macros.proteinGrams).toBe(168) // (1.8 + 0.3) g/kg * 80kg
    expect(macros.waterMl).toBe(3410) // base + 300ml hormone bonus
  })

  it('never lets carbs go negative when protein and fat already use up the budget', () => {
    const profile: UserProfile = { ...baseProfile, goal: 'aggressive_gain' }
    const macros = calculateMacros(profile, 100)
    expect(macros.carbsGrams).toBe(0)
  })

  it('adds activity-level water on top of the base amount', () => {
    const sedentary = calculateMacros(baseProfile, 2136).waterMl
    const veryActive = calculateMacros(
      { ...baseProfile, activityLevel: 'very_active' },
      2136,
    ).waterMl
    expect(veryActive - sedentary).toBe(900)
  })
})
