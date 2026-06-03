import { describe, it, expect, vi, afterEach } from 'vitest'
import { GoogleCalendarClient } from './google-calendar-client'

const mockConfig = {
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
  redirectUri: 'https://example.com/api/auth/google/callback',
}

const TOKEN_RESPONSE = { access_token: 'access-token-abc', expires_in: 3599, token_type: 'Bearer' }

const LIST_RESPONSE = {
  items: [
    { id: 'evt1', start: { dateTime: '2026-06-10T10:00:00Z' }, end: { dateTime: '2026-06-10T11:00:00Z' } },
    { id: 'evt2', start: { dateTime: '2026-06-11T14:00:00Z' }, end: { dateTime: '2026-06-11T16:00:00Z' } },
  ],
}

const CREATE_RESPONSE = { id: 'new-evt-id', summary: 'Tattoo booking' }

function makeClient(calendarId?: string) {
  return new GoogleCalendarClient('rt_stored', mockConfig, calendarId)
}

// ── fetch mock helpers ─────────────────────────────────────────────────────

const mockFetch = vi.fn()

function stubResponses(...responses: Array<[object, number?]>) {
  vi.stubGlobal('fetch', mockFetch)
  for (const [body, status = 200] of responses) {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(body), { status }))
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  mockFetch.mockReset()
})

// ── token refresh (via listEvents to trigger getAccessToken) ───────────────

describe('access token management', () => {
  it('fetches a new access token before the first API call', async () => {
    stubResponses([TOKEN_RESPONSE], [LIST_RESPONSE])
    await makeClient().listEvents()
    expect(mockFetch).toHaveBeenCalledWith(
      'https://oauth2.googleapis.com/token',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('caches the access token across multiple calls within TTL', async () => {
    stubResponses([TOKEN_RESPONSE], [LIST_RESPONSE], [LIST_RESPONSE])
    const client = makeClient()
    await client.listEvents()
    await client.listEvents()
    // Token endpoint called once, Calendar API called twice
    const tokenCalls = mockFetch.mock.calls.filter(([url]) =>
      url === 'https://oauth2.googleapis.com/token',
    )
    expect(tokenCalls).toHaveLength(1)
  })

  it('throws an auth-error-shaped object when token refresh returns 401', async () => {
    stubResponses([{ error: 'invalid_grant' }, 401])
    await expect(makeClient().listEvents()).rejects.toMatchObject({ code: 401 })
  })

  it('throws an auth-error-shaped object when token refresh returns 400 (revoked)', async () => {
    stubResponses([{ error: 'invalid_grant' }, 400])
    await expect(makeClient().listEvents()).rejects.toMatchObject({ code: 401 })
  })

  it('throws a generic error on other token refresh failures', async () => {
    stubResponses([{ error: 'server_error' }, 500])
    await expect(makeClient().listEvents()).rejects.toThrow('Token refresh failed')
  })
})

// ── listEvents ─────────────────────────────────────────────────────────────

describe('listEvents', () => {
  it('returns mapped events with id, start, and end strings', async () => {
    stubResponses([TOKEN_RESPONSE], [LIST_RESPONSE])
    const events = await makeClient().listEvents()
    expect(events).toHaveLength(2)
    expect(events[0]).toEqual({ id: 'evt1', start: '2026-06-10T10:00:00Z', end: '2026-06-10T11:00:00Z' })
  })

  it('falls back to date field for all-day events', async () => {
    stubResponses([TOKEN_RESPONSE], [{
      items: [{ id: 'allday', start: { date: '2026-06-12' }, end: { date: '2026-06-13' } }],
    }])
    const events = await makeClient().listEvents()
    expect(events[0].start).toBe('2026-06-12')
    expect(events[0].end).toBe('2026-06-13')
  })

  it('returns an empty array when items is empty', async () => {
    stubResponses([TOKEN_RESPONSE], [{ items: [] }])
    const events = await makeClient().listEvents()
    expect(events).toEqual([])
  })

  it('sends the Authorization header with Bearer token', async () => {
    stubResponses([TOKEN_RESPONSE], [LIST_RESPONSE])
    await makeClient().listEvents()
    const calendarCall = mockFetch.mock.calls.find(([url]) =>
      String(url).includes('googleapis.com/calendar'),
    )!
    expect(calendarCall[1].headers.Authorization).toBe('Bearer access-token-abc')
  })

  it('queries the primary calendar by default', async () => {
    stubResponses([TOKEN_RESPONSE], [LIST_RESPONSE])
    await makeClient().listEvents()
    const calendarCall = mockFetch.mock.calls.find(([url]) =>
      String(url).includes('googleapis.com/calendar'),
    )!
    expect(String(calendarCall[0])).toContain('primary')
  })

  it('uses the custom calendarId when provided', async () => {
    stubResponses([TOKEN_RESPONSE], [LIST_RESPONSE])
    await makeClient('miguel@example.com').listEvents()
    const calendarCall = mockFetch.mock.calls.find(([url]) =>
      String(url).includes('googleapis.com/calendar'),
    )!
    expect(String(calendarCall[0])).toContain(encodeURIComponent('miguel@example.com'))
  })

  it('throws auth-error-shaped object on 401 from Calendar API', async () => {
    stubResponses([TOKEN_RESPONSE], [{ error: 'unauthorized' }, 401])
    await expect(makeClient().listEvents()).rejects.toMatchObject({ code: 401 })
  })

  it('throws a generic Error on non-401 Calendar API failure', async () => {
    stubResponses([TOKEN_RESPONSE], [{}, 500])
    await expect(makeClient().listEvents()).rejects.toThrow('Calendar API error')
  })
})

// ── createEvent ────────────────────────────────────────────────────────────

describe('createEvent', () => {
  const eventInput = {
    summary: 'Tattoo booking — arm — customer@example.com',
    description: 'Session ID: sess_123',
    start: { dateTime: '2026-06-10T10:00:00Z' },
    end: { dateTime: '2026-06-10T11:00:00Z' },
  }

  it('returns the created event id', async () => {
    stubResponses([TOKEN_RESPONSE], [CREATE_RESPONSE])
    const result = await makeClient().createEvent(eventInput)
    expect(result.id).toBe('new-evt-id')
  })

  it('POSTs to the Calendar events endpoint', async () => {
    stubResponses([TOKEN_RESPONSE], [CREATE_RESPONSE])
    await makeClient().createEvent(eventInput)
    const calendarCall = mockFetch.mock.calls.find(([url]) =>
      String(url).includes('googleapis.com/calendar'),
    )!
    expect(calendarCall[1].method).toBe('POST')
  })

  it('sends the event data as JSON', async () => {
    stubResponses([TOKEN_RESPONSE], [CREATE_RESPONSE])
    await makeClient().createEvent(eventInput)
    const calendarCall = mockFetch.mock.calls.find(([url]) =>
      String(url).includes('googleapis.com/calendar'),
    )!
    const body = JSON.parse(calendarCall[1].body as string)
    expect(body.summary).toBe(eventInput.summary)
    expect(body.start.dateTime).toBe(eventInput.start.dateTime)
  })

  it('sends Authorization and Content-Type headers', async () => {
    stubResponses([TOKEN_RESPONSE], [CREATE_RESPONSE])
    await makeClient().createEvent(eventInput)
    const calendarCall = mockFetch.mock.calls.find(([url]) =>
      String(url).includes('googleapis.com/calendar'),
    )!
    expect(calendarCall[1].headers.Authorization).toBe('Bearer access-token-abc')
    expect(calendarCall[1].headers['Content-Type']).toBe('application/json')
  })

  it('throws auth-error-shaped object on 401 from Calendar API', async () => {
    stubResponses([TOKEN_RESPONSE], [{ error: 'unauthorized' }, 401])
    await expect(makeClient().createEvent(eventInput)).rejects.toMatchObject({ code: 401 })
  })

  it('throws a generic Error on non-401 Calendar API failure', async () => {
    stubResponses([TOKEN_RESPONSE], [{}, 500])
    await expect(makeClient().createEvent(eventInput)).rejects.toThrow('Calendar API error')
  })
})
