import type { Goal } from './goal'
import type { Sex } from './sex'
import type { ActivityLevel } from './activityLevel'
import type { HormoneUse } from './hormoneUse'
import type { TrainingRoutine } from './trainingRoutine'

export type UserProfile = {
  name: string
  goal: Goal
  sex: Sex
  age: number
  height: number
  weight: number
  bodyFatPercentage: number | null
  basalMetabolicRate: number | null
  activityLevel: ActivityLevel
  trainingRoutine: TrainingRoutine
  trainingSchedule: string | null
  hormoneUse: HormoneUse
}
