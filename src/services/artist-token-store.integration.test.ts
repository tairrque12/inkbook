import { describe, it, expect, vi } from 'vitest'
import { SupabaseVaultTokenStore } from './artist-token-store'
import { CalendarAuthError } from './calendar-service'

// Minimal mock matching VaultDb interface
function makeMockDb(overrides: {
  save?: { error: Error | null }
  get?: { data: string | null; error: Error | null }
} = {}) {
  return {
    rpc: vi.fn().mockImplementation((fn: string) => {
      if (fn === 'save_artist_calendar_token') {
        return Promise.resolve(overrides.save ?? { error: null })
      }
      if (fn === 'get_artist_calendar_token') {
        return Promise.resolve(overrides.get ?? { data: null, error: null })
      }
      return Promise.resolve({ data: null, error: null })
    }),
  }
}

describe('SupabaseVaultTokenStore', () => {
  describe('saveRefreshToken', () => {
    it('calls save_artist_calendar_token RPC', async () => {
      const db = makeMockDb()
      const store = new SupabaseVaultTokenStore(db as never)
      await store.saveRefreshToken('miguel', 'rt_abc123')
      expect(db.rpc).toHaveBeenCalledWith('save_artist_calendar_token', {
        p_slug: 'miguel',
        p_token: 'rt_abc123',
      })
    })

    it('resolves without error on success', async () => {
      const store = new SupabaseVaultTokenStore(makeMockDb() as never)
      await expect(store.saveRefreshToken('miguel', 'token')).resolves.toBeUndefined()
    })

    it('throws when the RPC returns an error', async () => {
      const db = makeMockDb({ save: { error: new Error('vault write failure') } })
      const store = new SupabaseVaultTokenStore(db as never)
      await expect(store.saveRefreshToken('miguel', 'token')).rejects.toThrow('vault write failure')
    })

    it('passes the artist slug as p_slug', async () => {
      const db = makeMockDb()
      const store = new SupabaseVaultTokenStore(db as never)
      await store.saveRefreshToken('tattoo-artist', 'token')
      const call = db.rpc.mock.calls[0]
      expect(call[1].p_slug).toBe('tattoo-artist')
    })

    it('passes the refresh token as p_token', async () => {
      const db = makeMockDb()
      const store = new SupabaseVaultTokenStore(db as never)
      await store.saveRefreshToken('miguel', 'super-secret-rt')
      const call = db.rpc.mock.calls[0]
      expect(call[1].p_token).toBe('super-secret-rt')
    })
  })

  describe('getRefreshToken', () => {
    it('calls get_artist_calendar_token RPC with the slug', async () => {
      const db = makeMockDb({ get: { data: 'rt_xyz', error: null } })
      const store = new SupabaseVaultTokenStore(db as never)
      await store.getRefreshToken('miguel')
      expect(db.rpc).toHaveBeenCalledWith('get_artist_calendar_token', { p_slug: 'miguel' })
    })

    it('returns the stored refresh token', async () => {
      const db = makeMockDb({ get: { data: 'rt_stored_token', error: null } })
      const store = new SupabaseVaultTokenStore(db as never)
      expect(await store.getRefreshToken('miguel')).toBe('rt_stored_token')
    })

    it('returns null when no token is stored for the artist', async () => {
      const db = makeMockDb({ get: { data: null, error: null } })
      const store = new SupabaseVaultTokenStore(db as never)
      expect(await store.getRefreshToken('unknown-artist')).toBeNull()
    })

    it('throws when the RPC returns an error', async () => {
      const db = makeMockDb({ get: { data: null, error: new Error('vault read error') } })
      const store = new SupabaseVaultTokenStore(db as never)
      await expect(store.getRefreshToken('miguel')).rejects.toThrow('vault read error')
    })
  })
})

// ── CalendarAuthError reconnect link ───────────────────────────────────────

describe('CalendarAuthError.reconnectUrl', () => {
  it('is undefined when constructed without a reconnect URL', () => {
    const err = new CalendarAuthError()
    expect(err.reconnectUrl).toBeUndefined()
  })

  it('carries the reconnect URL when provided', () => {
    const url = 'https://ink-book.com/api/auth/google/miguel'
    const err = new CalendarAuthError('auth failed', url)
    expect(err.reconnectUrl).toBe(url)
  })

  it('is still a CalendarAuthError with a reconnect URL', () => {
    const err = new CalendarAuthError('failed', 'https://example.com/reconnect')
    expect(err).toBeInstanceOf(CalendarAuthError)
    expect(err.name).toBe('CalendarAuthError')
  })
})
