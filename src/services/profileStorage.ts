import type { SavedProfile } from '../types/savedProfile'

const STORAGE_KEY = 'ai-diet-manager:dev-profiles'

export function getSavedProfiles(): SavedProfile[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    return JSON.parse(raw) as SavedProfile[]
  } catch {
    return []
  }
}

export function saveProfile(entry: SavedProfile): void {
  const withoutExisting = getSavedProfiles().filter(
    (item) => item.id !== entry.id,
  )
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...withoutExisting, entry]),
  )
}

export function deleteProfile(id: string): void {
  const remaining = getSavedProfiles().filter((item) => item.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining))
}
