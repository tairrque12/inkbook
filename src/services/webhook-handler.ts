import type { BookingSession, BookingSlot } from '@/types/booking'
import type { WriteBookingInput } from './calendar-service'

export interface EventStore {
  isProcessed(eventId: string): Promise<boolean>
  markProcessed(eventId: string, eventType: string): Promise<void>
}

export interface BookingDeps {
  getSessionByPaymentIntentId(paymentIntentId: string): Promise<BookingSession | null>
  getSlot(slotId: string): Promise<BookingSlot | null>
  confirm(sessionId: string): Promise<void>
}

export interface CalendarDeps {
  writeBookingToCalendar(input: WriteBookingInput): Promise<string>
}

export interface MailerDeps {
  sendBookingConfirmation(
    email: string,
    session: BookingSession,
    slot: BookingSlot | null,
  ): Promise<void>
  sendCalendarFailureAlert(artistEmail: string, sessionId: string): Promise<void>
}

export interface WebhookHandlerConfig {
  events: EventStore
  booking: BookingDeps
  calendar: CalendarDeps
  mailer: MailerDeps
  artistEmail: string
  maxCalendarRetries?: number
}

export class WebhookHandler {
  private readonly maxRetries: number

  constructor(private readonly cfg: WebhookHandlerConfig) {
    this.maxRetries = cfg.maxCalendarRetries ?? 3
  }

  async handlePaymentIntentSucceeded(paymentIntentId: string): Promise<void> {
    // Idempotency: bail out immediately if already processed
    if (await this.cfg.events.isProcessed(paymentIntentId)) return

    // Record first so concurrent calls can't double-process
    await this.cfg.events.markProcessed(paymentIntentId, 'payment_intent.succeeded')

    const session = await this.cfg.booking.getSessionByPaymentIntentId(paymentIntentId)
    if (!session) {
      console.warn(`[webhook] No session for payment_intent: ${paymentIntentId}`)
      return
    }

    await this.cfg.booking.confirm(session.id)

    const slot = session.slotId ? await this.cfg.booking.getSlot(session.slotId) : null

    if (slot) {
      const input: WriteBookingInput = {
        sessionId: session.id,
        customerEmail: session.customerEmail,
        placement: session.placement,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
      }

      let calendarWritten = false
      for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
        try {
          await this.cfg.calendar.writeBookingToCalendar(input)
          calendarWritten = true
          break
        } catch {
          if (attempt === this.maxRetries) {
            await this.cfg.mailer.sendCalendarFailureAlert(this.cfg.artistEmail, session.id)
          }
        }
      }

      void calendarWritten
    }

    await this.cfg.mailer.sendBookingConfirmation(session.customerEmail, session, slot)
  }
}
