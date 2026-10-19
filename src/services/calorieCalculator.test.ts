import { describe, expect, it } from 'vitest'
import { calculateDailyCalories, getDietStyle } from './calorieCalculator'
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

describe('calculateDailyCalories', () => {
  it('applies the Mifflin-St Jeor formula for a male profile', () => {
    // BMR = 10*80 + 6.25*180 - 5*30 + 5 = 1780; TDEE = 1780 * 1.2 (sedentary)
    expect(calculateDailyCalories(baseProfile)).toBe(2136)
  })

  it('applies the female BMR offset', () => {
    const profile: UserProfile = { ...baseProfile, sex: 'female' }
    // BMR = 10*80 + 6.25*180 - 5*30 - 161 = 1614; TDEE = 1614 * 1.2
    expect(calculateDailyCalories(profile)).toBe(1937)
  })

  it('subtracts 500 kcal for a lose goal', () => {
    const profile: UserProfile = { ...baseProfile, goal: 'lose' }
    expect(calculateDailyCalories(profile)).toBe(2136 - 500)
  })

  it('adds 500 kcal for an aggressive_gain goal', () => {
    const profile: UserProfile = { ...baseProfile, goal: 'aggressive_gain' }
    expect(calculateDailyCalories(profile)).toBe(2136 + 500)
  })

  it('prefers a measured BMR over the formula estimate', () => {
    const profile: UserProfile = {
      ...baseProfile,
      basalMetabolicRate: 1700,
      // Wildly different age/weight must be ignored once measured BMR is set.
      age: 90,
      weight: 40,
    }
    expect(calculateDailyCalories(profile)).toBe(Math.round(1700 * 1.2))
  })

  it('applies the hormone-use TDEE multiplier', () => {
    const profile: UserProfile = { ...baseProfile, hormoneUse: 'yes' }
    expect(calculateDailyCalories(profile)).toBe(Math.round(2136 * 1.05))
  })
})

describe('getDietStyle', () => {
  it('maps each goal to its diet style', () => {
    expect(getDietStyle('lose')).toBe('cutting')
    expect(getDietStyle('maintain')).toBe('moderate')
    expect(getDietStyle('lean_gain')).toBe('bulking')
    expect(getDietStyle('aggressive_gain')).toBe('bulking')
  })
})
