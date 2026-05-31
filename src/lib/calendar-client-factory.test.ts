import { describe, it, expect, vi } from 'vitest'
import { makeCalendarClientForArtist } from './calendar-client-factory'
import { GoogleCalendarClient } from './google-calendar-client'

const mockConfig = {
  clientId: 'id',
  clientSecret: 'secret',
  redirectUri: 'https://example.com/api/auth/google/callback',
}

function makeTokenStore(token: string | null) {
  return {
    getRefreshToken: vi.fn().mockResolvedValue(token),
    saveRefreshToken: vi.fn(),
  }
}

describe('makeCalendarClientForArtist', () => {
  it('returns null when no refresh token is stored for the artist', async () => {
    const store = makeTokenStore(null)
    const client = await makeCalendarClientForArtist('miguel', store, mockConfig)
    expect(client).toBeNull()
  })

  it('returns a GoogleCalendarClient when a token is found', async () => {
    const store = makeTokenStore('rt_stored')
    const client = await makeCalendarClientForArtist('miguel', store, mockConfig)
    expect(client).toBeInstanceOf(GoogleCalendarClient)
  })

  it('looks up the token using the provided slug', async () => {
    const store = makeTokenStore('rt_stored')
    await makeCalendarClientForArtist('tattoo-artist', store, mockConfig)
    expect(store.getRefreshToken).toHaveBeenCalledWith('tattoo-artist')
  })

  it('does not call getRefreshToken with wrong slug', async () => {
    const store = makeTokenStore('rt_stored')
    await makeCalendarClientForArtist('miguel', store, mockConfig)
    expect(store.getRefreshToken).not.toHaveBeenCalledWith('wrong-slug')
  })
})
