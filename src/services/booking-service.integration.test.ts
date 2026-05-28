import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BookingService, BookingConflictError } from './booking-service'
import type { BookingSlot, BookingSession } from '@/types/booking'

const mockSlot = (): BookingSlot => ({
  id: 'slot-1',
  artistId: 'artist-1',
  startsAt: new Date('2026-06-01T10:00:00Z'),
  endsAt: new Date('2026-06-01T13:00:00Z'),
  status: 'AVAILABLE',
})

const mockDb = () => ({
  getSlot: vi.fn(),
  updateSlot: vi.fn(),
  createSession: vi.fn(),
  updateSession: vi.fn(),
  getSession: vi.fn(),
})

describe('BookingService', () => {
  let db: ReturnType<typeof mockDb>
  let service: BookingService

  beforeEach(() => {
    db = mockDb()
    service = new BookingService(db)
  })

  describe('createSession', () => {
    it('creates a session with BROWSING status', async () => {
      const session: BookingSession = {
        id: 'session-1',
        artistId: 'artist-1',
        customerEmail: 'customer@example.com',
        size: 'medium',
        placement: 'arm',
        status: 'BROWSING',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      db.createSession.mockResolvedValue(session)

      const result = await service.createSession({
        artistId: 'artist-1',
        customerEmail: 'customer@example.com',
        size: 'medium',
        placement: 'arm',
      })

      expect(result.status).toBe('BROWSING')
      expect(db.createSession).toHaveBeenCalledOnce()
    })
  })

  describe('reserveSlot', () => {
    it('marks slot as HELD and transitions session to PAYMENT_INITIATED', async () => {
      const slot = mockSlot()
      db.getSlot.mockResolvedValue(slot)
      db.updateSlot.mockResolvedValue({ ...slot, status: 'HELD', heldUntil: expect.any(Date) })
      db.updateSession.mockResolvedValue({ status: 'PAYMENT_INITIATED', slotId: 'slot-1' })

      await service.reserveSlot('session-1', 'slot-1')

      expect(db.updateSlot).toHaveBeenCalledWith('slot-1', expect.objectContaining({ status: 'HELD' }))
      expect(db.updateSession).toHaveBeenCalledWith('session-1', expect.objectContaining({ status: 'PAYMENT_INITIATED' }))
    })

    it('throws BookingConflictError when slot is already HELD', async () => {
      db.getSlot.mockResolvedValue({ ...mockSlot(), status: 'HELD' })

      await expect(service.reserveSlot('session-1', 'slot-1')).rejects.toThrow(BookingConflictError)
    })

    it('throws BookingConflictError when slot is already BOOKED', async () => {
      db.getSlot.mockResolvedValue({ ...mockSlot(), status: 'BOOKED' })

      await expect(service.reserveSlot('session-1', 'slot-1')).rejects.toThrow(BookingConflictError)
    })

    it('concurrent requests: second call throws BookingConflictError', async () => {
      let callCount = 0
      db.getSlot.mockImplementation(async () => {
        callCount++
        if (callCount === 1) return mockSlot()
        return { ...mockSlot(), status: 'HELD' }
      })
      db.updateSlot.mockResolvedValue({ ...mockSlot(), status: 'HELD' })
      db.updateSession.mockResolvedValue({})

      const [first, second] = await Promise.allSettled([
        service.reserveSlot('session-1', 'slot-1'),
        service.reserveSlot('session-2', 'slot-1'),
      ])

      const failures = [first, second].filter(r => r.status === 'rejected')
      expect(failures.length).toBe(1)
      expect((failures[0] as PromiseRejectedResult).reason).toBeInstanceOf(BookingConflictError)
    })
  })

  describe('confirmBooking', () => {
    it('marks slot as BOOKED and transitions session to CONFIRMED', async () => {
      db.updateSlot.mockResolvedValue({ ...mockSlot(), status: 'BOOKED' })
      db.updateSession.mockResolvedValue({ status: 'CONFIRMED' })
      db.getSession.mockResolvedValue({ slotId: 'slot-1', status: 'PAYMENT_CONFIRMED' })

      await service.confirmBooking('session-1')

      expect(db.updateSlot).toHaveBeenCalledWith('slot-1', { status: 'BOOKED' })
      expect(db.updateSession).toHaveBeenCalledWith('session-1', { status: 'CONFIRMED' })
    })
  })

  describe('releaseHeldSlot', () => {
    it('releases HELD slot back to AVAILABLE on payment failure', async () => {
      db.getSession.mockResolvedValue({ slotId: 'slot-1', status: 'PAYMENT_INITIATED' })
      db.updateSlot.mockResolvedValue({ ...mockSlot(), status: 'AVAILABLE' })
      db.updateSession.mockResolvedValue({ status: 'SLOT_SELECTED' })

      await service.releaseHeldSlot('session-1')

      expect(db.updateSlot).toHaveBeenCalledWith('slot-1', { status: 'AVAILABLE', heldUntil: null })
      expect(db.updateSession).toHaveBeenCalledWith('session-1', { status: 'SLOT_SELECTED' })
    })

    it('is a no-op when session has no slotId', async () => {
      db.getSession.mockResolvedValue({ slotId: null, status: 'BROWSING' })

      await service.releaseHeldSlot('session-1')

      expect(db.updateSlot).not.toHaveBeenCalled()
    })
  })
})
