import type { BookingStatus } from '@/types/booking'

type BookingEvent =
  | 'SELECT_SIZE_PLACEMENT'
  | 'SELECT_SLOT'
  | 'INITIATE_PAYMENT'
  | 'CONFIRM_PAYMENT'
  | 'COMPLETE'
  | 'PAYMENT_FAILED'

type TransitionMap = Partial<Record<BookingEvent, BookingStatus>>

export const VALID_TRANSITIONS: Record<BookingStatus, TransitionMap> = {
  BROWSING: {
    SELECT_SIZE_PLACEMENT: 'SIZE_PLACEMENT_SELECTED',
  },
  SIZE_PLACEMENT_SELECTED: {
    SELECT_SLOT: 'SLOT_SELECTED',
  },
  SLOT_SELECTED: {
    INITIATE_PAYMENT: 'PAYMENT_INITIATED',
  },
  PAYMENT_INITIATED: {
    CONFIRM_PAYMENT: 'PAYMENT_CONFIRMED',
    PAYMENT_FAILED: 'SLOT_SELECTED',
  },
  PAYMENT_CONFIRMED: {
    COMPLETE: 'CONFIRMED',
  },
  CONFIRMED: {},
}

export function transition(from: BookingStatus, event: BookingEvent): BookingStatus {
  const next = VALID_TRANSITIONS[from]?.[event]
  if (!next) {
    throw new Error(`Invalid transition: ${from} + ${event}`)
  }
  return next
}
