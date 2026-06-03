import { cookieName } from '@/lib/admin-auth'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const name = cookieName(slug)
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `${name}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
    },
  })
}
