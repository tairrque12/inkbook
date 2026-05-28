import { describe, it, expect } from 'vitest'
import { calculatePriceEstimate, PRICING_MATRIX } from './pricing'
import type { TattooSize, TattooPlacement } from '@/types/booking'

describe('calculatePriceEstimate', () => {
  it('returns a min/max range in USD', () => {
    const estimate = calculatePriceEstimate('small', 'arm')
    expect(estimate.currency).toBe('USD')
    expect(estimate.min).toBeGreaterThan(0)
    expect(estimate.max).toBeGreaterThan(estimate.min)
  })

  it('sleeve costs more than small', () => {
    const small = calculatePriceEstimate('small', 'arm')
    const sleeve = calculatePriceEstimate('sleeve', 'arm')
    expect(sleeve.min).toBeGreaterThan(small.min)
  })

  it('back placement costs more than arm for same size', () => {
    const arm = calculatePriceEstimate('large', 'arm')
    const back = calculatePriceEstimate('large', 'back')
    expect(back.min).toBeGreaterThanOrEqual(arm.min)
  })

  it('throws on unknown size', () => {
    expect(() => calculatePriceEstimate('giant' as TattooSize, 'arm')).toThrow()
  })

  it('throws on unknown placement', () => {
    expect(() => calculatePriceEstimate('small', 'forehead' as TattooPlacement)).toThrow()
  })

  it('all size/placement combinations have entries in PRICING_MATRIX', () => {
    const sizes: TattooSize[] = ['small', 'medium', 'large', 'sleeve']
    const placements: TattooPlacement[] = ['arm', 'back', 'leg', 'chest', 'other']
    for (const size of sizes) {
      for (const placement of placements) {
        expect(() => calculatePriceEstimate(size, placement)).not.toThrow()
      }
    }
  })
})
