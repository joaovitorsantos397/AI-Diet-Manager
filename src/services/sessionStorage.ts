import type { Language } from '../types/language'
import type { CoachId } from '../types/coach'
import type { UserProfile } from '../types/userProfile'
import type { ChatMessage } from '../types/message'
import type { NutritionLogEntry } from '../types/nutritionLogEntry'
import type { WeightLogEntry } from '../types/weightLogEntry'

const STORAGE_KEY = 'ai-diet-manager:session'

export type StoredSession = {
  language: Language
  coachId: CoachId
  profile: UserProfile
  messages: ChatMessage[]
  nutritionLog: NutritionLogEntry[]
  weightLog: WeightLogEntry[]
  bandejaoUser: boolean | null
}

export function getSession(): StoredSession | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as StoredSession
  } catch {
    return null
  }
}

export function saveSession(session: StoredSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}
