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
