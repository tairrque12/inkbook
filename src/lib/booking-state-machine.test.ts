import { describe, it, expect } from 'vitest'
import { transition } from './booking-state-machine'

describe('BookingStateMachine', () => {
  describe('valid transitions', () => {
    it('transitions BROWSING → VISUALIZING', () => {
      expect(transition('BROWSING', 'START_VISUALIZE')).toBe('VISUALIZING')
    })

    it('transitions BROWSING → SIZE_PLACEMENT_SELECTED (skip visualizer)', () => {
      expect(transition('BROWSING', 'SELECT_SIZE_PLACEMENT')).toBe('SIZE_PLACEMENT_SELECTED')
    })

    it('transitions VISUALIZING → SIZE_PLACEMENT_SELECTED', () => {
      expect(transition('VISUALIZING', 'SELECT_SIZE_PLACEMENT')).toBe('SIZE_PLACEMENT_SELECTED')
    })

    it('transitions SIZE_PLACEMENT_SELECTED → SLOT_SELECTED', () => {
      expect(transition('SIZE_PLACEMENT_SELECTED', 'SELECT_SLOT')).toBe('SLOT_SELECTED')
    })

    it('transitions SLOT_SELECTED → PAYMENT_INITIATED', () => {
      expect(transition('SLOT_SELECTED', 'INITIATE_PAYMENT')).toBe('PAYMENT_INITIATED')
    })

    it('transitions PAYMENT_INITIATED → PAYMENT_CONFIRMED', () => {
      expect(transition('PAYMENT_INITIATED', 'CONFIRM_PAYMENT')).toBe('PAYMENT_CONFIRMED')
    })

    it('transitions PAYMENT_CONFIRMED → CONFIRMED', () => {
      expect(transition('PAYMENT_CONFIRMED', 'COMPLETE')).toBe('CONFIRMED')
    })
  })

  describe('failure paths', () => {
    it('transitions PAYMENT_INITIATED → SLOT_SELECTED on payment failure (slot released)', () => {
      expect(transition('PAYMENT_INITIATED', 'PAYMENT_FAILED')).toBe('SLOT_SELECTED')
    })

    it('transitions VISUALIZING → SIZE_PLACEMENT_SELECTED on GPT-4o failure', () => {
      expect(transition('VISUALIZING', 'VISUALIZER_FAILED')).toBe('SIZE_PLACEMENT_SELECTED')
    })
  })

  describe('invalid transitions', () => {
    it('throws on BROWSING → CONFIRMED (invalid jump)', () => {
      expect(() => transition('BROWSING', 'COMPLETE')).toThrow('Invalid transition')
    })

    it('throws on CONFIRMED → PAYMENT_INITIATED (backwards transition)', () => {
      expect(() => transition('CONFIRMED', 'INITIATE_PAYMENT')).toThrow('Invalid transition')
    })

    it('throws on PAYMENT_CONFIRMED → SLOT_SELECTED (backwards transition)', () => {
      expect(() => transition('PAYMENT_CONFIRMED', 'SELECT_SLOT')).toThrow('Invalid transition')
    })
  })
})
