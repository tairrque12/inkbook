import { describe, it, expect } from 'vitest'
import { getArtist } from './mock-artists'

describe('getArtist', () => {
  it('returns the miguel profile for the miguel slug', () => {
    const artist = getArtist('miguel')
    expect(artist).not.toBeNull()
    expect(artist!.slug).toBe('miguel')
    expect(artist!.firstName).toBe('Miguel')
  })

  it('returns null for an unknown slug', () => {
    expect(getArtist('does-not-exist')).toBeNull()
    expect(getArtist('')).toBeNull()
  })

  it('returned profile has required portfolio items with all fields', () => {
    const artist = getArtist('miguel')!
    expect(artist.portfolio.length).toBeGreaterThan(0)
    for (const item of artist.portfolio) {
      expect(item.id).toBeTruthy()
      expect(item.title).toBeTruthy()
      expect(item.date).toBeTruthy()
      expect(item.style).toBeTruthy()
    }
  })

  it('returned profile has available and unavailable slots', () => {
    const artist = getArtist('miguel')!
    const available = artist.availableSlots.filter(s => s.available)
    const unavailable = artist.availableSlots.filter(s => !s.available)
    expect(available.length).toBeGreaterThan(0)
    expect(unavailable.length).toBeGreaterThan(0)
  })

  it('some slots have a null estimatedPrice (full-day / custom)', () => {
    const artist = getArtist('miguel')!
    const nullPriceSlots = artist.availableSlots.filter(s => s.estimatedPrice === null)
    expect(nullPriceSlots.length).toBeGreaterThan(0)
  })

  it('profile has valid numeric fields', () => {
    const artist = getArtist('miguel')!
    expect(artist.rating).toBeGreaterThan(0)
    expect(artist.totalWorks).toBeGreaterThan(0)
    expect(artist.yearsActive).toBeGreaterThan(0)
  })

  it('defaultSize and defaultPlacement are valid booking type values', () => {
    const artist = getArtist('miguel')!
    expect(['small', 'medium', 'large', 'sleeve']).toContain(artist.defaultSize)
    expect(['arm', 'back', 'leg', 'chest', 'other']).toContain(artist.defaultPlacement)
  })
})
