import { getOrSeedPasswordHash } from '@/lib/admin-supabase'
import { verifyPassword, createSessionToken, cookieName } from '@/lib/admin-auth'
import { getArtist } from '@/lib/mock-artists'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  if (!getArtist(slug)) {
    return Response.json({ error: 'Artist not found' }, { status: 404 })
  }

  let body: { password?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.password) {
    return Response.json({ error: 'Password required' }, { status: 400 })
  }

  const hash = await getOrSeedPasswordHash(slug)
  if (!hash) {
    return Response.json({ error: 'Admin not configured — set ADMIN_PASSWORD env var' }, { status: 503 })
  }

  const valid = await verifyPassword(body.password, hash)
  if (!valid) {
    return Response.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = await createSessionToken(slug)
  const name = cookieName(slug)
  const maxAge = 24 * 60 * 60

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `${name}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`,
    },
  })
}
