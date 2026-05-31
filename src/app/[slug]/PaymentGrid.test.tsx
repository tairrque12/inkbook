// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PaymentGrid, PAYMENT_METHODS } from './PaymentGrid'

describe('PAYMENT_METHODS', () => {
  it('contains exactly 11 methods', () => {
    expect(PAYMENT_METHODS).toHaveLength(11)
  })

  const expectedBrands = [
    'Visa',
    'Mastercard',
    'American Express',
    'Discover',
    'Apple Pay',
    'Google Pay',
    'Cash App Pay',
    'Afterpay',
    'Klarna',
    'Affirm',
    'Link',
  ]

  for (const brand of expectedBrands) {
    it(`includes ${brand}`, () => {
      expect(PAYMENT_METHODS.some((m) => m.name === brand)).toBe(true)
    })
  }

  it('every method has a non-empty name, bg color, and text color', () => {
    for (const method of PAYMENT_METHODS) {
      expect(method.name.length).toBeGreaterThan(0)
      expect(method.bg.startsWith('#')).toBe(true)
      expect(method.textColor.length).toBeGreaterThan(0)
    }
  })

  it('Visa uses blue #1A1F71', () => {
    const visa = PAYMENT_METHODS.find((m) => m.name === 'Visa')
    expect(visa?.bg).toBe('#1A1F71')
  })

  it('Mastercard mark color includes red #EB001B', () => {
    const mc = PAYMENT_METHODS.find((m) => m.name === 'Mastercard')
    expect(mc?.markColors).toContain('#EB001B')
  })

  it('Cash App Pay uses green #00D64F', () => {
    const cashApp = PAYMENT_METHODS.find((m) => m.name === 'Cash App Pay')
    expect(cashApp?.bg).toBe('#00D64F')
  })

  it('Afterpay uses mint #B2FCE4 with dark text', () => {
    const afterpay = PAYMENT_METHODS.find((m) => m.name === 'Afterpay')
    expect(afterpay?.bg).toBe('#B2FCE4')
    expect(afterpay?.textColor).toBe('#000')
  })

  it('Klarna uses pink #FFB3C7 with dark text', () => {
    const klarna = PAYMENT_METHODS.find((m) => m.name === 'Klarna')
    expect(klarna?.bg).toBe('#FFB3C7')
    expect(klarna?.textColor).toBe('#000')
  })

  it('Link uses cyan #00D4FF with dark text', () => {
    const link = PAYMENT_METHODS.find((m) => m.name === 'Link')
    expect(link?.bg).toBe('#00D4FF')
    expect(link?.textColor).toBe('#000')
  })
})

describe('PaymentGrid', () => {
  it('renders without crashing', () => {
    const { container } = render(<PaymentGrid />)
    expect(container.firstChild).not.toBeNull()
  })

  it('renders the "Payment Options" heading', () => {
    render(<PaymentGrid />)
    expect(screen.getByText('Payment Options')).toBeInTheDocument()
  })

  it('renders a badge for every payment method', () => {
    render(<PaymentGrid />)
    for (const method of PAYMENT_METHODS) {
      expect(screen.getByText(method.name)).toBeInTheDocument()
    }
  })

  it('renders the Stripe security badge', () => {
    render(<PaymentGrid />)
    expect(screen.getByText(/secured by stripe/i)).toBeInTheDocument()
  })

  it('links the Stripe badge to stripe.com/docs/security', () => {
    render(<PaymentGrid />)
    const link = screen.getByRole('link', { name: /secured by stripe/i })
    expect(link).toHaveAttribute('href', 'https://stripe.com/docs/security')
  })

  it('renders the grid container', () => {
    const { container } = render(<PaymentGrid />)
    const grid = container.querySelector('[data-testid="payment-grid"]')
    expect(grid).not.toBeNull()
  })
})
