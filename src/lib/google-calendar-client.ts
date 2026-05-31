import { GOOGLE_TOKEN_ENDPOINT, refreshAccessToken } from './google-oauth'
import type { OAuthConfig } from './google-oauth'
import type { GoogleClient, GoogleEvent } from '@/services/calendar-service'

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3/calendars'

interface ApiEvent {
  id: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
}

export class GoogleCalendarClient implements GoogleClient {
  private accessToken: string | null = null
  private tokenExpiresAt = 0

  constructor(
    private readonly refreshToken: string,
    private readonly config: OAuthConfig,
    private readonly calendarId = 'primary',
  ) {}

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken
    }

    let tokens
    try {
      tokens = await refreshAccessToken(this.config, this.refreshToken)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      // Google returns 400 or 401 for revoked/expired refresh tokens
      if (msg.includes('invalid_grant') || msg.includes('400') || msg.includes('401')) {
        throw { code: 401, message: msg }
      }
      throw err
    }

    this.accessToken = tokens.access_token
    // Subtract 60-second buffer so we refresh before the token actually expires
    this.tokenExpiresAt = Date.now() + (tokens.expires_in - 60) * 1000
    return this.accessToken
  }

  async listEvents(): Promise<GoogleEvent[]> {
    const token = await this.getAccessToken()
    const url = new URL(`${CALENDAR_API}/${encodeURIComponent(this.calendarId)}/events`)
    url.searchParams.set('timeMin', new Date().toISOString())
    url.searchParams.set('singleEvents', 'true')
    url.searchParams.set('orderBy', 'startTime')
    url.searchParams.set('maxResults', '100')

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.status === 401) throw { code: 401 }
    if (!res.ok) throw new Error(`Calendar API error: ${res.status}`)

    const data = await res.json() as { items?: ApiEvent[] }
    return (data.items ?? []).map((evt) => ({
      id: evt.id,
      start: evt.start?.dateTime ?? evt.start?.date ?? '',
      end: evt.end?.dateTime ?? evt.end?.date ?? '',
    }))
  }

  async createEvent(event: {
    summary: string
    description?: string
    start: { dateTime: string }
    end: { dateTime: string }
  }): Promise<{ id: string }> {
    const token = await this.getAccessToken()
    const url = `${CALENDAR_API}/${encodeURIComponent(this.calendarId)}/events`

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })

    if (res.status === 401) throw { code: 401 }
    if (!res.ok) throw new Error(`Calendar API error: ${res.status}`)

    const data = await res.json() as { id: string }
    return { id: data.id }
  }
}

// Re-export so consumers can reference the endpoint in tests without coupling to internals
export { GOOGLE_TOKEN_ENDPOINT }
