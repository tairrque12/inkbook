import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  GOOGLE_SCOPES,
  GOOGLE_AUTH_ENDPOINT,
  GOOGLE_TOKEN_ENDPOINT,
  buildAuthUrl,
  exchangeCodeForTokens,
  getOAuthConfig,
  getReconnectUrl,
} from './google-oauth'

const mockConfig = {
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
  redirectUri: 'https://example.com/api/auth/google/callback',
}

// ── constants ──────────────────────────────────────────────────────────────

describe('GOOGLE_SCOPES', () => {
  it('includes calendar.readonly', () => {
    expect(GOOGLE_SCOPES).toContain('https://www.googleapis.com/auth/calendar.readonly')
  })
  it('includes calendar.events', () => {
    expect(GOOGLE_SCOPES).toContain('https://www.googleapis.com/auth/calendar.events')
  })
  it('contains exactly 2 scopes', () => {
    expect(GOOGLE_SCOPES).toHaveLength(2)
  })
})

// ── buildAuthUrl ───────────────────────────────────────────────────────────

describe('buildAuthUrl', () => {
  it('points to the Google OAuth endpoint', () => {
    const url = buildAuthUrl(mockConfig, 'miguel')
    expect(url.origin + url.pathname).toBe(GOOGLE_AUTH_ENDPOINT)
  })

  it('sets client_id from config', () => {
    const url = buildAuthUrl(mockConfig, 'miguel')
    expect(url.searchParams.get('client_id')).toBe('test-client-id')
  })

  it('sets redirect_uri from config', () => {
    const url = buildAuthUrl(mockConfig, 'miguel')
    expect(url.searchParams.get('redirect_uri')).toBe(mockConfig.redirectUri)
  })

  it('sets response_type to code', () => {
    const url = buildAuthUrl(mockConfig, 'miguel')
    expect(url.searchParams.get('response_type')).toBe('code')
  })

  it('requests offline access so Google issues a refresh token', () => {
    const url = buildAuthUrl(mockConfig, 'miguel')
    expect(url.searchParams.get('access_type')).toBe('offline')
  })

  it('forces consent prompt to guarantee a refresh token on every auth', () => {
    const url = buildAuthUrl(mockConfig, 'miguel')
    expect(url.searchParams.get('prompt')).toBe('consent')
  })

  it('encodes the artist slug as the OAuth state parameter', () => {
    const url = buildAuthUrl(mockConfig, 'miguel')
    expect(url.searchParams.get('state')).toBe('miguel')
  })

  it('includes the calendar.readonly scope', () => {
    const url = buildAuthUrl(mockConfig, 'miguel')
    expect(url.searchParams.get('scope')).toContain('calendar.readonly')
  })

  it('includes the calendar.events scope', () => {
    const url = buildAuthUrl(mockConfig, 'miguel')
    expect(url.searchParams.get('scope')).toContain('calendar.events')
  })

  it('returns a URL object', () => {
    const url = buildAuthUrl(mockConfig, 'miguel')
    expect(url).toBeInstanceOf(URL)
  })
})

// ── exchangeCodeForTokens ──────────────────────────────────────────────────

describe('exchangeCodeForTokens', () => {
  const mockFetch = vi.fn()

  afterEach(() => {
    vi.unstubAllGlobals()
    mockFetch.mockReset()
  })

  function stubFetch(body: object, status = 200) {
    vi.stubGlobal('fetch', mockFetch)
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(body), { status }),
    )
  }

  it('POSTs to the Google token endpoint', async () => {
    stubFetch({ access_token: 'at', refresh_token: 'rt', expires_in: 3600, token_type: 'Bearer', scope: '' })
    await exchangeCodeForTokens(mockConfig, 'code123')
    expect(mockFetch).toHaveBeenCalledWith(GOOGLE_TOKEN_ENDPOINT, expect.objectContaining({ method: 'POST' }))
  })

  it('sends grant_type=authorization_code', async () => {
    stubFetch({ access_token: 'at', expires_in: 3600, token_type: 'Bearer', scope: '' })
    await exchangeCodeForTokens(mockConfig, 'code123')
    const body = (mockFetch.mock.calls[0][1] as RequestInit).body as string
    expect(body).toContain('grant_type=authorization_code')
  })

  it('sends the authorization code', async () => {
    stubFetch({ access_token: 'at', expires_in: 3600, token_type: 'Bearer', scope: '' })
    await exchangeCodeForTokens(mockConfig, 'special-code-xyz')
    const body = (mockFetch.mock.calls[0][1] as RequestInit).body as string
    expect(body).toContain('code=special-code-xyz')
  })

  it('sends client_id and client_secret', async () => {
    stubFetch({ access_token: 'at', expires_in: 3600, token_type: 'Bearer', scope: '' })
    await exchangeCodeForTokens(mockConfig, 'code')
    const body = (mockFetch.mock.calls[0][1] as RequestInit).body as string
    expect(body).toContain('client_id=test-client-id')
    expect(body).toContain('client_secret=test-client-secret')
  })

  it('returns the parsed token response', async () => {
    stubFetch({ access_token: 'at123', refresh_token: 'rt456', expires_in: 3600, token_type: 'Bearer', scope: 'calendar.readonly' })
    const result = await exchangeCodeForTokens(mockConfig, 'code')
    expect(result.access_token).toBe('at123')
    expect(result.refresh_token).toBe('rt456')
    expect(result.expires_in).toBe(3600)
  })

  it('throws when the token endpoint returns a non-200 status', async () => {
    stubFetch({ error: 'invalid_grant' }, 400)
    await expect(exchangeCodeForTokens(mockConfig, 'bad-code')).rejects.toThrow('Token exchange failed')
  })

  it('includes the Google error code in the thrown message', async () => {
    stubFetch({ error: 'invalid_grant' }, 400)
    await expect(exchangeCodeForTokens(mockConfig, 'bad-code')).rejects.toThrow('invalid_grant')
  })

  it('falls back to the HTTP status in the error message when no error field', async () => {
    stubFetch({}, 500)
    await expect(exchangeCodeForTokens(mockConfig, 'bad-code')).rejects.toThrow('500')
  })
})

// ── getOAuthConfig ─────────────────────────────────────────────────────────

describe('getOAuthConfig', () => {
  afterEach(() => {
    delete process.env.GOOGLE_CLIENT_ID
    delete process.env.GOOGLE_CLIENT_SECRET
  })

  it('throws when GOOGLE_CLIENT_ID is missing', () => {
    process.env.GOOGLE_CLIENT_SECRET = 'secret'
    expect(() => getOAuthConfig('https://example.com')).toThrow('GOOGLE_CLIENT_ID')
  })

  it('throws when GOOGLE_CLIENT_SECRET is missing', () => {
    process.env.GOOGLE_CLIENT_ID = 'id'
    expect(() => getOAuthConfig('https://example.com')).toThrow('GOOGLE_CLIENT_SECRET')
  })

  it('throws when both env vars are missing', () => {
    expect(() => getOAuthConfig('https://example.com')).toThrow()
  })

  it('sets redirectUri to <baseUrl>/api/auth/google/callback', () => {
    process.env.GOOGLE_CLIENT_ID = 'id'
    process.env.GOOGLE_CLIENT_SECRET = 'secret'
    const config = getOAuthConfig('https://ink-book.com')
    expect(config.redirectUri).toBe('https://ink-book.com/api/auth/google/callback')
  })

  it('returns clientId from env', () => {
    process.env.GOOGLE_CLIENT_ID = 'my-client-id'
    process.env.GOOGLE_CLIENT_SECRET = 'my-secret'
    expect(getOAuthConfig('https://example.com').clientId).toBe('my-client-id')
  })

  it('returns clientSecret from env', () => {
    process.env.GOOGLE_CLIENT_ID = 'id'
    process.env.GOOGLE_CLIENT_SECRET = 'my-secret'
    expect(getOAuthConfig('https://example.com').clientSecret).toBe('my-secret')
  })
})

// ── getReconnectUrl ────────────────────────────────────────────────────────

describe('getReconnectUrl', () => {
  it('builds the reconnect URL for a given slug', () => {
    expect(getReconnectUrl('https://ink-book.com', 'miguel')).toBe(
      'https://ink-book.com/api/auth/google/miguel',
    )
  })

  it('works with localhost for local development', () => {
    expect(getReconnectUrl('http://localhost:3000', 'artist-x')).toBe(
      'http://localhost:3000/api/auth/google/artist-x',
    )
  })
})
