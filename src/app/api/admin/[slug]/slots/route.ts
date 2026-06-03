import { getAdminSupabase, requireAuth } from '@/lib/admin-supabase'
import { SlotService } from '@/services/slot-service'
import type { SlotType } from '@/services/slot-service'
import { getArtist } from '@/lib/mock-artists'

const VALID_SLOT_TYPES: SlotType[] = ['small', 'half_day', 'full_day', 'sleeve']

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  if (!getArtist(slug)) return Response.json({ error: 'Artist not found' }, { status: 404 })
  if (!await requireAuth(req, slug)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const db = getAdminSupabase()
    const service = new SlotService(db as never)
    const slots = await service.listForAdmin(slug)
    return Response.json({ slots })
  } catch (err) {
    console.error('[admin] slots list error:', err)
    return Response.json({ error: 'Failed to fetch slots' }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  if (!getArtist(slug)) return Response.json({ error: 'Artist not found' }, { status: 404 })
  if (!await requireAuth(req, slug)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { date?: string; startTime?: string; endTime?: string; slotType?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.date || !body.startTime || !body.endTime || !body.slotType) {
    return Response.json({ error: 'date, startTime, endTime, and slotType are required' }, { status: 400 })
  }

  if (!VALID_SLOT_TYPES.includes(body.slotType as SlotType)) {
    return Response.json({ error: `slotType must be one of: ${VALID_SLOT_TYPES.join(', ')}` }, { status: 400 })
  }

  const startsAt = new Date(`${body.date}T${body.startTime}:00`).toISOString()
  const endsAt = new Date(`${body.date}T${body.endTime}:00`).toISOString()

  try {
    const db = getAdminSupabase()
    const service = new SlotService(db as never)
    const slot = await service.create({ artistSlug: slug, startsAt, endsAt, slotType: body.slotType as SlotType })
    return Response.json({ slot }, { status: 201 })
  } catch (err) {
    console.error('[admin] slot create error:', err)
    return Response.json({ error: 'Failed to create slot' }, { status: 500 })
  }
}
