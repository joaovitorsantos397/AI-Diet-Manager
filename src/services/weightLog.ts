import type { UserProfile } from '../types/userProfile'
import type { WeightLogEntry } from '../types/weightLogEntry'

export function getRecentWeightEntries(
  log: WeightLogEntry[],
  limit: number,
): WeightLogEntry[] {
  return [...log].sort((a, b) => a.timestamp - b.timestamp).slice(-limit)
}

export function getLatestWeightEntry(
  log: WeightLogEntry[],
): WeightLogEntry | null {
  return getRecentWeightEntries(log, 1)[0] ?? null
}

// Calorie/macro targets should track the user's current weight, not the
// one captured at onboarding — otherwise they silently go stale as the
// user gains or loses weight over the course of a cycle/diet.
export function getEffectiveProfile(
  profile: UserProfile,
  log: WeightLogEntry[],
): UserProfile {
  const latest = getLatestWeightEntry(log)
  // A weigh-in doesn't always come with a fresh BMR reading (most are
  // just a scale number) — look back for the most recent entry that did
  // include one, rather than losing the last known measured BMR whenever
  // a plain weigh-in is logged afterward.
  const latestBmrEntry = [...log]
    .sort((a, b) => b.timestamp - a.timestamp)
    .find((entry) => entry.basalMetabolicRate !== null)

  return {
    ...profile,
    weight: latest?.weightKg ?? profile.weight,
    basalMetabolicRate:
      latestBmrEntry?.basalMetabolicRate ?? profile.basalMetabolicRate,
  }
}
