import { getAdminSupabase, requireAuth } from '@/lib/admin-supabase'
import { ConsultationService } from '@/services/consultation-service'
import { SlotService } from '@/services/slot-service'
import type { ConsultationStatus } from '@/services/consultation-service'
import { getArtist } from '@/lib/mock-artists'

const VALID_STATUSES: ConsultationStatus[] = ['pending', 'approved', 'declined', 'confirmed']

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params

  if (!getArtist(slug)) return Response.json({ error: 'Artist not found' }, { status: 404 })
  if (!await requireAuth(req, slug)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const db = getAdminSupabase()
    const consultations = new ConsultationService(db as never)
    await consultations.delete(id)
    return Response.json({ ok: true })
  } catch (err) {
    console.error('[admin] consultation delete error:', err)
    return Response.json({ error: 'Failed to delete consultation' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params

  if (!getArtist(slug)) return Response.json({ error: 'Artist not found' }, { status: 404 })
  if (!await requireAuth(req, slug)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { status?: string; slotId?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.status || !VALID_STATUSES.includes(body.status as ConsultationStatus)) {
    return Response.json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 })
  }

  try {
    const db = getAdminSupabase()
    const consultations = new ConsultationService(db as never)
    await consultations.updateStatus(id, body.status as ConsultationStatus)

    // When marking confirmed, also mark the linked slot as BOOKED
    if (body.status === 'confirmed' && body.slotId) {
      const slots = new SlotService(db as never)
      await slots.markBooked(body.slotId)
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('[admin] consultation update error:', err)
    return Response.json({ error: 'Failed to update consultation' }, { status: 500 })
  }
}
