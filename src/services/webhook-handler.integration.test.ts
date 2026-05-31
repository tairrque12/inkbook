import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WebhookHandler } from './webhook-handler'
import type { WebhookHandlerConfig } from './webhook-handler'
import type { BookingSession, BookingSlot } from '@/types/booking'

// ── fixtures ───────────────────────────────────────────────────────────────

const SESSION: BookingSession = {
  id: 'sess_1',
  artistId: 'artist_1',
  customerEmail: 'customer@example.com',
  size: 'medium',
  placement: 'arm',
  slotId: 'slot_1',
  status: 'PAYMENT_INITIATED',
  stripePaymentIntentId: 'pi_test123',
  createdAt: new Date('2026-06-01T09:00:00Z'),
  updatedAt: new Date('2026-06-01T09:00:00Z'),
}

const SLOT: BookingSlot = {
  id: 'slot_1',
  artistId: 'artist_1',
  startsAt: new Date('2026-06-10T10:00:00Z'),
  endsAt: new Date('2026-06-10T13:00:00Z'),
  status: 'HELD',
}

// ── helpers ────────────────────────────────────────────────────────────────

function makeDeps(overrides: Partial<WebhookHandlerConfig> = {}): WebhookHandlerConfig {
  return {
    events: {
      isProcessed: vi.fn().mockResolvedValue(false),
      markProcessed: vi.fn().mockResolvedValue(undefined),
    },
    booking: {
      getSessionByPaymentIntentId: vi.fn().mockResolvedValue(SESSION),
      getSlot: vi.fn().mockResolvedValue(SLOT),
      confirm: vi.fn().mockResolvedValue(undefined),
    },
    calendar: {
      writeBookingToCalendar: vi.fn().mockResolvedValue('cal_evt_1'),
    },
    mailer: {
      sendBookingConfirmation: vi.fn().mockResolvedValue(undefined),
      sendCalendarFailureAlert: vi.fn().mockResolvedValue(undefined),
    },
    artistEmail: 'artist@example.com',
    maxCalendarRetries: 3,
    ...overrides,
  }
}

// ── tests ──────────────────────────────────────────────────────────────────

describe('WebhookHandler.handlePaymentIntentSucceeded', () => {
  const PI_ID = 'pi_test123'

  describe('idempotency', () => {
    it('returns immediately without side effects when event already processed', async () => {
      const cfg = makeDeps({
        events: {
          isProcessed: vi.fn().mockResolvedValue(true),
          markProcessed: vi.fn(),
        },
      })
      await new WebhookHandler(cfg).handlePaymentIntentSucceeded(PI_ID)
      expect(cfg.events.markProcessed).not.toHaveBeenCalled()
      expect(cfg.booking.confirm).not.toHaveBeenCalled()
      expect(cfg.mailer.sendBookingConfirmation).not.toHaveBeenCalled()
    })

    it('marks the event as processed before doing anything else', async () => {
      const callOrder: string[] = []
      const cfg = makeDeps({
        events: {
          isProcessed: vi.fn().mockResolvedValue(false),
          markProcessed: vi.fn().mockImplementation(async () => { callOrder.push('markProcessed') }),
        },
        booking: {
          getSessionByPaymentIntentId: vi.fn().mockImplementation(async () => { callOrder.push('getSession'); return SESSION }),
          getSlot: vi.fn().mockResolvedValue(SLOT),
          confirm: vi.fn().mockResolvedValue(undefined),
        },
      })
      await new WebhookHandler(cfg).handlePaymentIntentSucceeded(PI_ID)
      expect(callOrder[0]).toBe('markProcessed')
      expect(callOrder[1]).toBe('getSession')
    })

    it('marks the event with the correct type', async () => {
      const cfg = makeDeps()
      await new WebhookHandler(cfg).handlePaymentIntentSucceeded(PI_ID)
      expect(cfg.events.markProcessed).toHaveBeenCalledWith(PI_ID, 'payment_intent.succeeded')
    })
  })

  describe('missing session', () => {
    it('returns without confirming or emailing when no session found', async () => {
      const cfg = makeDeps({
        booking: {
          getSessionByPaymentIntentId: vi.fn().mockResolvedValue(null),
          getSlot: vi.fn(),
          confirm: vi.fn(),
        },
      })
      await new WebhookHandler(cfg).handlePaymentIntentSucceeded(PI_ID)
      expect(cfg.booking.confirm).not.toHaveBeenCalled()
      expect(cfg.mailer.sendBookingConfirmation).not.toHaveBeenCalled()
    })

    it('still marks the event as processed even when no session found', async () => {
      const cfg = makeDeps({
        booking: {
          getSessionByPaymentIntentId: vi.fn().mockResolvedValue(null),
          getSlot: vi.fn(),
          confirm: vi.fn(),
        },
      })
      await new WebhookHandler(cfg).handlePaymentIntentSucceeded(PI_ID)
      expect(cfg.events.markProcessed).toHaveBeenCalled()
    })
  })

  describe('booking confirmation', () => {
    it('calls confirm with the session id', async () => {
      const cfg = makeDeps()
      await new WebhookHandler(cfg).handlePaymentIntentSucceeded(PI_ID)
      expect(cfg.booking.confirm).toHaveBeenCalledWith(SESSION.id)
    })

    it('looks up the session by the payment intent id', async () => {
      const cfg = makeDeps()
      await new WebhookHandler(cfg).handlePaymentIntentSucceeded(PI_ID)
      expect(cfg.booking.getSessionByPaymentIntentId).toHaveBeenCalledWith(PI_ID)
    })
  })

  describe('calendar write', () => {
    it('writes the booking to the calendar', async () => {
      const cfg = makeDeps()
      await new WebhookHandler(cfg).handlePaymentIntentSucceeded(PI_ID)
      expect(cfg.calendar.writeBookingToCalendar).toHaveBeenCalledOnce()
    })

    it('passes correct slot times to writeBookingToCalendar', async () => {
      const cfg = makeDeps()
      await new WebhookHandler(cfg).handlePaymentIntentSucceeded(PI_ID)
      expect(cfg.calendar.writeBookingToCalendar).toHaveBeenCalledWith(
        expect.objectContaining({
          startsAt: SLOT.startsAt,
          endsAt: SLOT.endsAt,
        }),
      )
    })

    it('passes session metadata to writeBookingToCalendar', async () => {
      const cfg = makeDeps()
      await new WebhookHandler(cfg).handlePaymentIntentSucceeded(PI_ID)
      expect(cfg.calendar.writeBookingToCalendar).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: SESSION.id,
          customerEmail: SESSION.customerEmail,
          placement: SESSION.placement,
        }),
      )
    })

    it('skips calendar write when session has no slotId', async () => {
      const cfg = makeDeps({
        booking: {
          getSessionByPaymentIntentId: vi.fn().mockResolvedValue({ ...SESSION, slotId: undefined }),
          getSlot: vi.fn(),
          confirm: vi.fn().mockResolvedValue(undefined),
        },
      })
      await new WebhookHandler(cfg).handlePaymentIntentSucceeded(PI_ID)
      expect(cfg.calendar.writeBookingToCalendar).not.toHaveBeenCalled()
    })
  })

  describe('calendar retry', () => {
    it('retries up to maxCalendarRetries times on failure', async () => {
      const cfg = makeDeps({
        calendar: {
          writeBookingToCalendar: vi.fn().mockRejectedValue(new Error('calendar down')),
        },
        maxCalendarRetries: 3,
      })
      await new WebhookHandler(cfg).handlePaymentIntentSucceeded(PI_ID)
      expect(cfg.calendar.writeBookingToCalendar).toHaveBeenCalledTimes(3)
    })

    it('alerts the artist after all retries are exhausted', async () => {
      const cfg = makeDeps({
        calendar: {
          writeBookingToCalendar: vi.fn().mockRejectedValue(new Error('calendar down')),
        },
        maxCalendarRetries: 3,
      })
      await new WebhookHandler(cfg).handlePaymentIntentSucceeded(PI_ID)
      expect(cfg.mailer.sendCalendarFailureAlert).toHaveBeenCalledOnce()
      expect(cfg.mailer.sendCalendarFailureAlert).toHaveBeenCalledWith(
        'artist@example.com',
        SESSION.id,
      )
    })

    it('does not alert artist when calendar write succeeds on a retry', async () => {
      const cfg = makeDeps({
        calendar: {
          writeBookingToCalendar: vi.fn()
            .mockRejectedValueOnce(new Error('timeout'))
            .mockRejectedValueOnce(new Error('timeout'))
            .mockResolvedValueOnce('cal_evt_ok'),
        },
        maxCalendarRetries: 3,
      })
      await new WebhookHandler(cfg).handlePaymentIntentSucceeded(PI_ID)
      expect(cfg.mailer.sendCalendarFailureAlert).not.toHaveBeenCalled()
    })

    it('stops retrying once calendar write succeeds', async () => {
      const cfg = makeDeps({
        calendar: {
          writeBookingToCalendar: vi.fn()
            .mockRejectedValueOnce(new Error('timeout'))
            .mockResolvedValueOnce('cal_evt_ok'),
        },
        maxCalendarRetries: 3,
      })
      await new WebhookHandler(cfg).handlePaymentIntentSucceeded(PI_ID)
      expect(cfg.calendar.writeBookingToCalendar).toHaveBeenCalledTimes(2)
    })

    it('uses 3 retries by default when maxCalendarRetries is not specified', async () => {
      const cfg = makeDeps({
        calendar: {
          writeBookingToCalendar: vi.fn().mockRejectedValue(new Error('down')),
        },
      })
      delete (cfg as Partial<WebhookHandlerConfig>).maxCalendarRetries
      await new WebhookHandler(cfg).handlePaymentIntentSucceeded(PI_ID)
      expect(cfg.calendar.writeBookingToCalendar).toHaveBeenCalledTimes(3)
    })
  })

  describe('confirmation email', () => {
    it('sends a confirmation email to the customer', async () => {
      const cfg = makeDeps()
      await new WebhookHandler(cfg).handlePaymentIntentSucceeded(PI_ID)
      expect(cfg.mailer.sendBookingConfirmation).toHaveBeenCalledOnce()
      expect(cfg.mailer.sendBookingConfirmation).toHaveBeenCalledWith(
        SESSION.customerEmail,
        SESSION,
        SLOT,
      )
    })

    it('still sends confirmation email even when all calendar retries fail', async () => {
      const cfg = makeDeps({
        calendar: {
          writeBookingToCalendar: vi.fn().mockRejectedValue(new Error('calendar down')),
        },
      })
      await new WebhookHandler(cfg).handlePaymentIntentSucceeded(PI_ID)
      expect(cfg.mailer.sendBookingConfirmation).toHaveBeenCalledOnce()
    })

    it('sends confirmation without slot when session has no slotId', async () => {
      const sessionNoSlot = { ...SESSION, slotId: undefined }
      const cfg = makeDeps({
        booking: {
          getSessionByPaymentIntentId: vi.fn().mockResolvedValue(sessionNoSlot),
          getSlot: vi.fn(),
          confirm: vi.fn().mockResolvedValue(undefined),
        },
      })
      await new WebhookHandler(cfg).handlePaymentIntentSucceeded(PI_ID)
      expect(cfg.mailer.sendBookingConfirmation).toHaveBeenCalledWith(
        sessionNoSlot.customerEmail,
        sessionNoSlot,
        null,
      )
    })
  })
})
