import { describe, it, expect } from 'vitest'
import { getMonthDays, getFirstDayOfWeek } from './mock-calendar'

describe('getFirstDayOfWeek', () => {
  it('returns correct day of week for June 2026 (Monday = 1)', () => {
    expect(getFirstDayOfWeek(2026, 5)).toBe(1) // June 2026 starts on Monday
  })

  it('returns correct day of week for July 2026 (Wednesday = 3)', () => {
    expect(getFirstDayOfWeek(2026, 6)).toBe(3)
  })
})

describe('getMonthDays', () => {
  it('returns 30 days for June 2026', () => {
    const days = getMonthDays(2026, 5)
    expect(days).toHaveLength(30)
  })

  it('returns 31 days for July 2026', () => {
    const days = getMonthDays(2026, 6)
    expect(days).toHaveLength(31)
  })

  it('marks past dates as past', () => {
    const days = getMonthDays(2026, 4) // May 2026 — all before May 30
    const may1 = days.find(d => d.date === '2026-05-01')
    expect(may1?.status).toBe('past')
  })

  it('marks Sunday and Monday as unavailable', () => {
    const days = getMonthDays(2026, 5) // June 2026
    const sunday = days.find(d => d.date === '2026-06-07') // Sunday
    const monday = days.find(d => d.date === '2026-06-08') // Monday
    expect(sunday?.status).toBe('unavailable')
    expect(monday?.status).toBe('unavailable')
  })

  it('marks pre-booked dates as booked', () => {
    const days = getMonthDays(2026, 5)
    const booked = days.find(d => d.date === '2026-06-02')
    expect(booked?.status).toBe('booked')
  })

  it('marks open Tue–Sat dates as available', () => {
    const days = getMonthDays(2026, 5)
    const available = days.find(d => d.date === '2026-06-03') // Wednesday, not booked
    expect(available?.status).toBe('available')
  })

  it('includes correct date strings in YYYY-MM-DD format', () => {
    const days = getMonthDays(2026, 5)
    expect(days[0].date).toBe('2026-06-01')
    expect(days[29].date).toBe('2026-06-30')
  })
})
