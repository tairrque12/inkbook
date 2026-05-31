import { createClient } from '@supabase/supabase-js'
import { getArtist } from '@/lib/mock-artists'
import { CalendarService, CalendarAuthError } from '@/services/calendar-service'
import { SupabaseVaultTokenStore } from '@/services/artist-token-store'
import { makeCalendarClientForArtist } from '@/lib/calendar-client-factory'
import { getOAuthConfig, getReconnectUrl } from '@/lib/google-oauth'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  if (!getArtist(slug)) {
    return Response.json({ error: 'Artist not found' }, { status: 404 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  // OAuth env vars not configured — tell the client calendar isn't connected
  let oauthConfig
  try {
    oauthConfig = getOAuthConfig(baseUrl)
  } catch {
    return Response.json({ connected: false, reason: 'oauth_not_configured' })
  }

  // Supabase env vars not configured
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ connected: false, reason: 'database_not_configured' })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const tokenStore = new SupabaseVaultTokenStore(supabase as never)

  const googleClient = await makeCalendarClientForArtist(slug, tokenStore, oauthConfig)
  if (!googleClient) {
    return Response.json({
      connected: false,
      reason: 'not_connected',
      reconnectUrl: getReconnectUrl(baseUrl, slug),
    })
  }

  const calendarService = new CalendarService(googleClient, slug)

  try {
    const slots = await calendarService.getAvailableSlots()
    return Response.json({
      connected: true,
      slots: slots.map((s) => ({
        id: s.id,
        startsAt: s.startsAt.toISOString(),
        endsAt: s.endsAt.toISOString(),
        status: s.status,
      })),
    })
  } catch (err) {
    if (err instanceof CalendarAuthError) {
      return Response.json({
        connected: false,
        reason: 'auth_error',
        reconnectUrl: getReconnectUrl(baseUrl, slug),
      })
    }
    console.error('[availability] Calendar error:', err)
    return Response.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}
