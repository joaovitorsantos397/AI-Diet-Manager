import { describe, expect, it } from 'vitest'
import { isSameDay } from './date'

describe('isSameDay', () => {
  it('returns true for the same calendar day', () => {
    expect(isSameDay(new Date(2026, 9, 16, 1), new Date(2026, 9, 16, 23))).toBe(true)
  })

  it('returns false for different calendar days', () => {
    expect(isSameDay(new Date(2026, 9, 16), new Date(2026, 9, 17))).toBe(false)
  })
})
