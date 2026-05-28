export type BookingStatus =
  | 'BROWSING'
  | 'VISUALIZING'
  | 'SIZE_PLACEMENT_SELECTED'
  | 'SLOT_SELECTED'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_CONFIRMED'
  | 'CONFIRMED'

export type SlotStatus = 'AVAILABLE' | 'HELD' | 'BOOKED'

export type TattooSize = 'small' | 'medium' | 'large' | 'sleeve'
export type TattooPlacement = 'arm' | 'back' | 'leg' | 'chest' | 'other'

export interface BookingSlot {
  id: string
  artistId: string
  startsAt: Date
  endsAt: Date
  status: SlotStatus
  heldUntil?: Date | null
}

export interface BookingSession {
  id: string
  artistId: string
  customerEmail: string
  size: TattooSize
  placement: TattooPlacement
  slotId?: string
  status: BookingStatus
  stripePaymentIntentId?: string
  createdAt: Date
  updatedAt: Date
}

export interface PriceEstimate {
  min: number
  max: number
  currency: 'USD'
}
