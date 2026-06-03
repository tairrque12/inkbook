import { createClient } from '@supabase/supabase-js'
import { getArtist } from '@/lib/mock-artists'
import { SlotService } from '@/services/slot-service'

function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  return createClient(url, key)
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  if (!getArtist(slug)) {
    return Response.json({ error: 'Artist not found' }, { status: 404 })
  }

  try {
    const db = getSupabase()
    const service = new SlotService(db as never)
    const slots = await service.listAvailable(slug)
    return Response.json({
      slots: slots.map(s => ({
        id: s.id,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        slotType: s.slotType,
      })),
    })
  } catch (err) {
    console.error('[availability] Error fetching slots:', err)
    return Response.json({ slots: [] })
  }
}
