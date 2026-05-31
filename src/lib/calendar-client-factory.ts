import type { OAuthConfig } from './google-oauth'
import type { ArtistTokenStore } from '@/services/artist-token-store'
import { GoogleCalendarClient } from './google-calendar-client'

export async function makeCalendarClientForArtist(
  slug: string,
  tokenStore: ArtistTokenStore,
  config: OAuthConfig,
): Promise<GoogleCalendarClient | null> {
  const refreshToken = await tokenStore.getRefreshToken(slug)
  if (!refreshToken) return null
  return new GoogleCalendarClient(refreshToken, config)
}
