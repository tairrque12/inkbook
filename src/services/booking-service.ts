import type { BookingSlot, BookingSession, TattooSize, TattooPlacement } from '@/types/booking'

export class BookingConflictError extends Error {
  constructor(slotId: string) {
    super(`Slot ${slotId} is no longer available`)
    this.name = 'BookingConflictError'
  }
}

interface Db {
  getSlot(slotId: string): Promise<BookingSlot>
  updateSlot(slotId: string, patch: Partial<BookingSlot>): Promise<BookingSlot>
  createSession(data: Omit<BookingSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<BookingSession>
  updateSession(sessionId: string, patch: Partial<BookingSession>): Promise<BookingSession>
  getSession(sessionId: string): Promise<BookingSession>
}

export class BookingService {
  constructor(private readonly db: Db) {}

  async createSession(input: {
    artistId: string
    customerEmail: string
    size: TattooSize
    placement: TattooPlacement
  }): Promise<BookingSession> {
    return this.db.createSession({ ...input, status: 'BROWSING' })
  }

  async reserveSlot(sessionId: string, slotId: string): Promise<void> {
    const slot = await this.db.getSlot(slotId)

    if (slot.status === 'HELD' || slot.status === 'BOOKED') {
      throw new BookingConflictError(slotId)
    }

    const heldUntil = new Date(Date.now() + 15 * 60 * 1000)
    await this.db.updateSlot(slotId, { status: 'HELD', heldUntil })
    await this.db.updateSession(sessionId, { status: 'PAYMENT_INITIATED', slotId })
  }

  async confirmBooking(sessionId: string): Promise<void> {
    const session = await this.db.getSession(sessionId)
    if (session.slotId) {
      await this.db.updateSlot(session.slotId, { status: 'BOOKED' })
    }
    await this.db.updateSession(sessionId, { status: 'CONFIRMED' })
  }

  async releaseHeldSlot(sessionId: string): Promise<void> {
    const session = await this.db.getSession(sessionId)
    if (!session.slotId) return

    await this.db.updateSlot(session.slotId, { status: 'AVAILABLE', heldUntil: null })
    await this.db.updateSession(sessionId, { status: 'SLOT_SELECTED' })
  }
}
