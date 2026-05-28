import type { TattooSize, TattooPlacement, PriceEstimate } from '@/types/booking'

type PricingKey = `${TattooSize}:${TattooPlacement}`

export const PRICING_MATRIX: Record<PricingKey, [number, number]> = {
  'small:arm':   [150, 300],
  'small:back':  [200, 350],
  'small:leg':   [150, 300],
  'small:chest': [200, 350],
  'small:other': [150, 300],

  'medium:arm':   [400, 700],
  'medium:back':  [500, 800],
  'medium:leg':   [400, 700],
  'medium:chest': [500, 800],
  'medium:other': [400, 700],

  'large:arm':   [800, 1400],
  'large:back':  [1000, 1800],
  'large:leg':   [800, 1400],
  'large:chest': [1000, 1600],
  'large:other': [800, 1400],

  'sleeve:arm':   [2000, 4000],
  'sleeve:back':  [2500, 5000],
  'sleeve:leg':   [2000, 4000],
  'sleeve:chest': [2500, 4500],
  'sleeve:other': [2000, 4000],
}

export function calculatePriceEstimate(size: TattooSize, placement: TattooPlacement): PriceEstimate {
  const key: PricingKey = `${size}:${placement}`
  const range = PRICING_MATRIX[key]
  if (!range) {
    throw new Error(`No pricing entry for size=${size} placement=${placement}`)
  }
  return { min: range[0], max: range[1], currency: 'USD' }
}
