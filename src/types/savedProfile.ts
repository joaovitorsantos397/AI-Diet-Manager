import type { Language } from './language'
import type { CoachId } from './coach'
import type { UserProfile } from './userProfile'
import type { ChatMessage } from './message'
import type { NutritionLogEntry } from './nutritionLogEntry'
import type { WeightLogEntry } from './weightLogEntry'

export type SavedProfile = {
  id: string
  label: string
  language: Language
  coachId: CoachId
  profile: UserProfile
  messages: ChatMessage[]
  nutritionLog: NutritionLogEntry[]
  weightLog: WeightLogEntry[]
}
