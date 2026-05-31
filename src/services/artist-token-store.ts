export interface ArtistTokenStore {
  saveRefreshToken(slug: string, token: string): Promise<void>
  getRefreshToken(slug: string): Promise<string | null>
}

// Minimal interface over the Supabase client — only the RPC surface we need.
// The real implementation passes a `createClient()` result; tests pass a mock.
export interface VaultDb {
  rpc(
    fn: 'save_artist_calendar_token',
    params: { p_slug: string; p_token: string },
  ): Promise<{ error: Error | null }>
  rpc(
    fn: 'get_artist_calendar_token',
    params: { p_slug: string },
  ): Promise<{ data: string | null; error: Error | null }>
}

export class SupabaseVaultTokenStore implements ArtistTokenStore {
  constructor(private readonly db: VaultDb) {}

  async saveRefreshToken(slug: string, token: string): Promise<void> {
    const { error } = await this.db.rpc('save_artist_calendar_token', {
      p_slug: slug,
      p_token: token,
    })
    if (error) throw error
  }

  async getRefreshToken(slug: string): Promise<string | null> {
    const { data, error } = await this.db.rpc('get_artist_calendar_token', {
      p_slug: slug,
    })
    if (error) throw error
    return data
  }
}
