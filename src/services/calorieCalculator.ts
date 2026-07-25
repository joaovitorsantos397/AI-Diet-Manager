import type { UserProfile } from '../types/userProfile'
import type { ActivityLevel } from '../types/activityLevel'
import type { Goal } from '../types/goal'

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

const GOAL_CALORIE_ADJUSTMENT: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  lean_gain: 150,
  aggressive_gain: 500,
}

// Reference adjustment, not a medical claim: reported hormone/PED use is
// associated with a higher metabolic turnover. See docs/03_DECISION_LOG.md.
const HORMONE_TDEE_MULTIPLIER = 1.05

function calculateBMR(profile: UserProfile): number {
  // A measured BMR (e.g. from a bioimpedance scale) accounts for actual
  // body composition and is preferred over the formula-based estimate.
  if (profile.basalMetabolicRate !== null) {
    return profile.basalMetabolicRate
  }

  const { sex, age, height, weight } = profile
  const base = 10 * weight + 6.25 * height - 5 * age
  return sex === 'male' ? base + 5 : base - 161
}

export function calculateDailyCalories(profile: UserProfile): number {
  const bmr = calculateBMR(profile)
  const activityCalories = bmr * ACTIVITY_MULTIPLIERS[profile.activityLevel]
  const tdee =
    profile.hormoneUse === 'yes'
      ? activityCalories * HORMONE_TDEE_MULTIPLIER
      : activityCalories
  const target = tdee + GOAL_CALORIE_ADJUSTMENT[profile.goal]
  return Math.round(target)
}

export type DietStyle = 'cutting' | 'moderate' | 'bulking'

const DIET_STYLE_BY_GOAL: Record<Goal, DietStyle> = {
  lose: 'cutting',
  maintain: 'moderate',
  lean_gain: 'bulking',
  aggressive_gain: 'bulking',
}

export function getDietStyle(goal: Goal): DietStyle {
  return DIET_STYLE_BY_GOAL[goal]
}
