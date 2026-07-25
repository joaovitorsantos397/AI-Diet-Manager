import type { UserProfile } from '../types/userProfile'
import type { Goal } from '../types/goal'
import type { ActivityLevel } from '../types/activityLevel'
import type { Macros } from '../types/macros'

const PROTEIN_GRAMS_PER_KG: Record<Goal, number> = {
  lose: 2.2,
  maintain: 1.8,
  lean_gain: 2.2,
  aggressive_gain: 2.5,
}

const FAT_CALORIE_SHARE = 0.25
// AHA guidance: keep saturated fat under ~7% of total calories.
const SATURATED_FAT_CALORIE_SHARE = 0.07
const CALORIES_PER_GRAM_PROTEIN = 4
const CALORIES_PER_GRAM_FAT = 9
const CALORIES_PER_GRAM_CARBS = 4
const FIBER_GRAMS_PER_1000_KCAL = 14
const WATER_ML_PER_KG = 35
const HIGH_PROTEIN_THRESHOLD_G_PER_KG = 2.2
const HIGH_PROTEIN_EXTRA_WATER_ML = 500

// Higher fiber intake needs more water to move through the gut
// comfortably — a standard nutrition-science relationship, applied to
// everyone (not hormone-specific).
const FIBER_WATER_ML_PER_GRAM = 10

// More activity means more sweat loss to replace — the actual subject
// of the ACSM fluid-replacement guidance, applied correctly here
// (activity-driven, not as a stand-in for clinical hematocrit claims).
const ACTIVITY_WATER_BONUS_ML: Record<ActivityLevel, number> = {
  sedentary: 0,
  light: 200,
  moderate: 400,
  active: 600,
  very_active: 900,
}

// Reference adjustments, not medical claims: reported hormone/PED use is
// associated with higher protein utilization and hydration needs. These are
// documented starting points, not a diagnosis. See docs/03_DECISION_LOG.md.
const HORMONE_PROTEIN_BONUS_G_PER_KG = 0.3
const HORMONE_EXTRA_WATER_ML = 300

export function calculateMacros(
  profile: UserProfile,
  dailyCalories: number,
): Macros {
  const baseProteinGramsPerKg = PROTEIN_GRAMS_PER_KG[profile.goal]
  const proteinGramsPerKg =
    profile.hormoneUse === 'yes'
      ? baseProteinGramsPerKg + HORMONE_PROTEIN_BONUS_G_PER_KG
      : baseProteinGramsPerKg

  const proteinGrams = Math.round(proteinGramsPerKg * profile.weight)
  const proteinCalories = proteinGrams * CALORIES_PER_GRAM_PROTEIN

  const fatCalories = dailyCalories * FAT_CALORIE_SHARE
  const fatGrams = Math.round(fatCalories / CALORIES_PER_GRAM_FAT)
  const saturatedFatCapGrams = Math.round(
    (dailyCalories * SATURATED_FAT_CALORIE_SHARE) / CALORIES_PER_GRAM_FAT,
  )

  const remainingCalories = Math.max(
    dailyCalories - proteinCalories - fatCalories,
    0,
  )
  const carbsGrams = Math.round(remainingCalories / CALORIES_PER_GRAM_CARBS)

  const fiberGrams = Math.round(
    (dailyCalories / 1000) * FIBER_GRAMS_PER_1000_KCAL,
  )

  const hasHighProteinIntake =
    proteinGramsPerKg >= HIGH_PROTEIN_THRESHOLD_G_PER_KG
  const baseWaterMl =
    profile.weight * WATER_ML_PER_KG +
    (hasHighProteinIntake ? HIGH_PROTEIN_EXTRA_WATER_ML : 0) +
    fiberGrams * FIBER_WATER_ML_PER_GRAM +
    ACTIVITY_WATER_BONUS_ML[profile.activityLevel]
  const waterMl = Math.round(
    profile.hormoneUse === 'yes'
      ? baseWaterMl + HORMONE_EXTRA_WATER_ML
      : baseWaterMl,
  )

  return {
    proteinGrams,
    fatGrams,
    saturatedFatCapGrams,
    carbsGrams,
    fiberGrams,
    waterMl,
  }
}
