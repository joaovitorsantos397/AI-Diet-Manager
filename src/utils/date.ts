export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// Backdated meal logging (e.g. "ontem no churrasco comi...") needs the
// entry's timestamp to land on that past calendar day, not "now" — this
// combines an explicit YYYY-MM-DD date with the entry's HH:MM mealTime
// into one timestamp. Falls back to Date.now() whenever the date is
// missing, malformed, or would land in the future (a hallucinated date
// is worse than just using today).
export function resolveLoggedTimestamp(
  loggedDate: string | null,
  mealTime: string,
): number {
  if (loggedDate === null) {
    return Date.now()
  }

  const dateMatch = loggedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!dateMatch) {
    return Date.now()
  }

  const [, yearStr, monthStr, dayStr] = dateMatch
  const timeMatch = mealTime.match(/^(\d{1,2}):(\d{2})$/)
  const hours = timeMatch ? Number(timeMatch[1]) : 12
  const minutes = timeMatch ? Number(timeMatch[2]) : 0

  const resolved = new Date(
    Number(yearStr),
    Number(monthStr) - 1,
    Number(dayStr),
    hours,
    minutes,
  )

  return resolved.getTime() > Date.now() ? Date.now() : resolved.getTime()
}
