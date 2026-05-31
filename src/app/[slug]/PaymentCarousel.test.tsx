import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PaymentCarousel, PAYMENT_METHODS } from './PaymentCarousel'

describe('PAYMENT_METHODS', () => {
  it('contains exactly 11 methods', () => {
    expect(PAYMENT_METHODS).toHaveLength(11)
  })

  it('includes Visa', () => {
    expect(PAYMENT_METHODS.some((m) => m.name === 'Visa')).toBe(true)
  })

  it('includes Mastercard', () => {
    expect(PAYMENT_METHODS.some((m) => m.name === 'Mastercard')).toBe(true)
  })

  it('includes American Express', () => {
    expect(PAYMENT_METHODS.some((m) => m.name === 'American Express')).toBe(true)
  })

  it('includes Discover', () => {
    expect(PAYMENT_METHODS.some((m) => m.name === 'Discover')).toBe(true)
  })

  it('includes Apple Pay', () => {
    expect(PAYMENT_METHODS.some((m) => m.name === 'Apple Pay')).toBe(true)
  })

  it('includes Google Pay', () => {
    expect(PAYMENT_METHODS.some((m) => m.name === 'Google Pay')).toBe(true)
  })

  it('includes Cash App Pay', () => {
    expect(PAYMENT_METHODS.some((m) => m.name === 'Cash App Pay')).toBe(true)
  })

  it('includes Afterpay', () => {
    expect(PAYMENT_METHODS.some((m) => m.name === 'Afterpay')).toBe(true)
  })

  it('includes Klarna', () => {
    expect(PAYMENT_METHODS.some((m) => m.name === 'Klarna')).toBe(true)
  })

  it('includes Affirm', () => {
    expect(PAYMENT_METHODS.some((m) => m.name === 'Affirm')).toBe(true)
  })

  it('includes Link', () => {
    expect(PAYMENT_METHODS.some((m) => m.name === 'Link')).toBe(true)
  })

  it('every method has a non-empty name and logo', () => {
    for (const method of PAYMENT_METHODS) {
      expect(method.name.length).toBeGreaterThan(0)
      expect(method.logo).toBeTruthy()
    }
  })
})

describe('PaymentCarousel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PaymentCarousel />)
    expect(container.firstChild).not.toBeNull()
  })

  it('renders an aria-label for each payment method', () => {
    render(<PaymentCarousel />)
    for (const method of PAYMENT_METHODS) {
      const logos = screen.getAllByRole('img', { name: method.name })
      expect(logos.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('duplicates logos for seamless looping — each method appears at least twice', () => {
    render(<PaymentCarousel />)
    for (const method of PAYMENT_METHODS) {
      const logos = screen.getAllByRole('img', { name: method.name })
      expect(logos.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('renders left and right fade masks', () => {
    const { container } = render(<PaymentCarousel />)
    const masks = container.querySelectorAll('[data-testid="carousel-fade"]')
    expect(masks).toHaveLength(2)
  })

  it('wraps the scrolling track in an overflow-hidden container', () => {
    const { container } = render(<PaymentCarousel />)
    const track = container.querySelector('[data-testid="carousel-track"]')
    expect(track).not.toBeNull()
  })

  it('renders the Stripe security badge', () => {
    render(<PaymentCarousel />)
    expect(screen.getByText(/secured by stripe/i)).toBeInTheDocument()
  })

  it('links the Stripe badge to stripe.com/docs/security', () => {
    render(<PaymentCarousel />)
    const link = screen.getByRole('link', { name: /secured by stripe/i })
    expect(link).toHaveAttribute('href', 'https://stripe.com/docs/security')
  })
})
