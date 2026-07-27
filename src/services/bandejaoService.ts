import type { BandejaoMenu } from '../types/bandejaoMenu'

// Bandejao Tracker is a separate, optional service — if it's not running
// or unreachable, the coach should just carry on without RU menu context
// instead of breaking the chat.
export async function fetchTodaysBandejaoMenu(): Promise<BandejaoMenu | null> {
  try {
    const response = await fetch('/bandejao/menu/today')
    if (!response.ok) {
      return null
    }
    return (await response.json()) as BandejaoMenu
  } catch {
    return null
  }
}
