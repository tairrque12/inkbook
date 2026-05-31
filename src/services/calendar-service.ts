import type { BookingSlot, TattooPlacement } from '@/types/booking'

export class CalendarAuthError extends Error {
  readonly reconnectUrl: string | undefined

  constructor(
    message = 'Google Calendar authentication failed — reconnect required',
    reconnectUrl?: string,
  ) {
    super(message)
    this.name = 'CalendarAuthError'
    this.reconnectUrl = reconnectUrl
  }
}

export interface GoogleEvent {
  id: string
  start: string
  end: string
}

export interface GoogleClient {
  listEvents(): Promise<GoogleEvent[]>
  createEvent(event: {
    summary: string
    description?: string
    start: { dateTime: string }
    end: { dateTime: string }
  }): Promise<{ id: string }>
}

interface WriteBookingInput {
  sessionId: string
  customerEmail: string
  placement: TattooPlacement
  startsAt: Date
  endsAt: Date
}

const CACHE_TTL_MS = 60_000

export class CalendarService {
  private cachedSlots: BookingSlot[] | null = null
  private cacheExpiresAt = 0
  private authBlocked = false

  constructor(
    private readonly client: GoogleClient,
    private readonly artistId: string,
  ) {}

  async getAvailableSlots(): Promise<BookingSlot[]> {
    if (this.authBlocked) throw new CalendarAuthError()

    if (this.cachedSlots && Date.now() < this.cacheExpiresAt) {
      return this.cachedSlots
    }

    let events: GoogleEvent[]
    try {
      events = await this.client.listEvents()
    } catch (err: unknown) {
      if (this.isAuthError(err)) {
        this.authBlocked = true
        throw new CalendarAuthError()
      }
      throw err
    }

    const slots: BookingSlot[] = events.map(evt => ({
      id: evt.id,
      artistId: this.artistId,
      startsAt: new Date(evt.start),
      endsAt: new Date(evt.end),
      status: 'AVAILABLE',
    }))

    this.cachedSlots = slots
    this.cacheExpiresAt = Date.now() + CACHE_TTL_MS

    return slots
  }

  async writeBookingToCalendar(input: WriteBookingInput): Promise<string> {
    try {
      const event = await this.client.createEvent({
        summary: `Tattoo booking — ${input.placement} — ${input.customerEmail}`,
        description: `Session ID: ${input.sessionId}`,
        start: { dateTime: input.startsAt.toISOString() },
        end: { dateTime: input.endsAt.toISOString() },
      })
      return event.id
    } catch (err: unknown) {
      if (this.isAuthError(err)) {
        this.authBlocked = true
        throw new CalendarAuthError()
      }
      throw err
    }
  }

  clearAuthError(): void {
    this.authBlocked = false
    this.cachedSlots = null
    this.cacheExpiresAt = 0
  }

  private isAuthError(err: unknown): boolean {
    return typeof err === 'object' && err !== null && (err as { code?: number }).code === 401
  }
}
