import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CalendarService, CalendarAuthError } from './calendar-service'

const mockGoogleClient = () => ({
  listEvents: vi.fn(),
  createEvent: vi.fn(),
  refreshToken: vi.fn(),
})

describe('CalendarService', () => {
  let googleClient: ReturnType<typeof mockGoogleClient>
  let service: CalendarService

  beforeEach(() => {
    googleClient = mockGoogleClient()
    service = new CalendarService(googleClient, 'artist-1')
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getAvailableSlots', () => {
    it('returns available slots from Google Calendar', async () => {
      googleClient.listEvents.mockResolvedValue([
        { id: 'evt-1', start: '2026-06-01T10:00:00Z', end: '2026-06-01T13:00:00Z' },
        { id: 'evt-2', start: '2026-06-07T14:00:00Z', end: '2026-06-07T17:00:00Z' },
      ])

      const slots = await service.getAvailableSlots()

      expect(slots).toHaveLength(2)
      expect(slots[0].startsAt).toBeInstanceOf(Date)
      expect(googleClient.listEvents).toHaveBeenCalledOnce()
    })

    it('caches results for 60 seconds — does not call API on second request within window', async () => {
      googleClient.listEvents.mockResolvedValue([])

      await service.getAvailableSlots()
      vi.advanceTimersByTime(30_000)
      await service.getAvailableSlots()

      expect(googleClient.listEvents).toHaveBeenCalledOnce()
    })

    it('re-fetches from API after cache TTL expires (60s)', async () => {
      googleClient.listEvents.mockResolvedValue([])

      await service.getAvailableSlots()
      vi.advanceTimersByTime(61_000)
      await service.getAvailableSlots()

      expect(googleClient.listEvents).toHaveBeenCalledTimes(2)
    })

    it('throws CalendarAuthError when token is expired', async () => {
      googleClient.listEvents.mockRejectedValue({ code: 401, message: 'Token expired' })

      await expect(service.getAvailableSlots()).rejects.toThrow(CalendarAuthError)
    })

    it('blocks new slot lookups after CalendarAuthError until re-authed', async () => {
      googleClient.listEvents.mockRejectedValue({ code: 401, message: 'Token expired' })

      await expect(service.getAvailableSlots()).rejects.toThrow(CalendarAuthError)

      // Second call should also throw immediately without hitting the API
      await expect(service.getAvailableSlots()).rejects.toThrow(CalendarAuthError)
      expect(googleClient.listEvents).toHaveBeenCalledOnce()
    })
  })

  describe('writeBookingToCalendar', () => {
    it('creates a calendar event with customer name, placement, and duration', async () => {
      googleClient.createEvent.mockResolvedValue({ id: 'new-evt' })

      await service.writeBookingToCalendar({
        sessionId: 'session-1',
        customerEmail: 'cust@example.com',
        placement: 'arm',
        startsAt: new Date('2026-06-01T10:00:00Z'),
        endsAt: new Date('2026-06-01T13:00:00Z'),
      })

      expect(googleClient.createEvent).toHaveBeenCalledWith(expect.objectContaining({
        summary: expect.stringContaining('arm'),
        start: expect.any(Object),
        end: expect.any(Object),
      }))
    })

    it('throws CalendarAuthError when token is expired during write', async () => {
      googleClient.createEvent.mockRejectedValue({ code: 401, message: 'Token revoked' })

      await expect(service.writeBookingToCalendar({
        sessionId: 'session-1',
        customerEmail: 'cust@example.com',
        placement: 'arm',
        startsAt: new Date(),
        endsAt: new Date(),
      })).rejects.toThrow(CalendarAuthError)
    })
  })

  describe('clearAuthError', () => {
    it('resets auth-blocked state so subsequent calls proceed', async () => {
      googleClient.listEvents
        .mockRejectedValueOnce({ code: 401 })
        .mockResolvedValueOnce([])

      await expect(service.getAvailableSlots()).rejects.toThrow(CalendarAuthError)

      service.clearAuthError()
      const slots = await service.getAvailableSlots()

      expect(slots).toEqual([])
    })
  })
})
