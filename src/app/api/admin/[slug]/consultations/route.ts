import { getAdminSupabase, requireAuth } from '@/lib/admin-supabase'
import { ConsultationService } from '@/services/consultation-service'
import { getArtist } from '@/lib/mock-artists'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  if (!getArtist(slug)) return Response.json({ error: 'Artist not found' }, { status: 404 })
  if (!await requireAuth(req, slug)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const db = getAdminSupabase()
    const service = new ConsultationService(db as never)
    const consultations = await service.list(slug)
    return Response.json({ consultations })
  } catch (err) {
    console.error('[admin] consultations list error:', err)
    return Response.json({ error: 'Failed to fetch consultations' }, { status: 500 })
  }
}
