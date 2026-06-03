import { getAdminSupabase, requireAuth } from '@/lib/admin-supabase'
import { SlotService } from '@/services/slot-service'
import { getArtist } from '@/lib/mock-artists'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params

  if (!getArtist(slug)) return Response.json({ error: 'Artist not found' }, { status: 404 })
  if (!await requireAuth(req, slug)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const db = getAdminSupabase()
    const service = new SlotService(db as never)
    await service.delete(id)
    return Response.json({ ok: true })
  } catch (err) {
    console.error('[admin] slot delete error:', err)
    return Response.json({ error: 'Failed to delete slot' }, { status: 500 })
  }
}
