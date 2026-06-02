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

export interface WriteBookingInput {
  sessionId: string
  artistId: string
  customerEmail: string
  placement: TattooPlacement
  startsAt: Date
  endsAt: Date
}

const CACHE_TTL_MS = 60_000

export class CalendarService {
  private cachedEvents: GoogleEvent[] | null = null
  private cacheExpiresAt = 0
  private authBlocked = false

  constructor(
    private readonly client: GoogleClient,
    private readonly artistId: string,
  ) {}

  private async fetchEvents(): Promise<GoogleEvent[]> {
    if (this.authBlocked) throw new CalendarAuthError()

    if (this.cachedEvents && Date.now() < this.cacheExpiresAt) {
      return this.cachedEvents
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

    this.cachedEvents = events
    this.cacheExpiresAt = Date.now() + CACHE_TTL_MS
    return events
  }

  async getAvailableSlots(): Promise<BookingSlot[]> {
    const events = await this.fetchEvents()
    return events.map(evt => ({
      id: evt.id,
      artistId: this.artistId,
      startsAt: new Date(evt.start),
      endsAt: new Date(evt.end),
      status: 'AVAILABLE' as const,
    }))
  }

  // Returns dates (YYYY-MM-DD) that are fully blocked by all-day events.
  // All-day events have date-only start/end strings with no 'T'. Google Calendar
  // uses an exclusive end date, so a Jun 8–13 block has end "2026-06-14".
  // Multi-day events are expanded to cover every date in the range.
  // Timed appointments do not block the day — the artist may still be bookable.
  async getBlockedDates(): Promise<Set<string>> {
    const events = await this.fetchEvents()
    const blocked = new Set<string>()
    for (const evt of events) {
      if (evt.start.includes('T')) continue // timed event — skip
      const cursor = new Date(evt.start + 'T00:00:00Z')
      const endDay = new Date(evt.end + 'T00:00:00Z') // exclusive
      while (cursor < endDay) {
        blocked.add(cursor.toISOString().slice(0, 10))
        cursor.setUTCDate(cursor.getUTCDate() + 1)
      }
    }
    return blocked
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
    this.cachedEvents = null
    this.cacheExpiresAt = 0
  }

  private isAuthError(err: unknown): boolean {
    return typeof err === 'object' && err !== null && (err as { code?: number }).code === 401
  }
}
