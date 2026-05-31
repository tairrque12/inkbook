import { redirect } from 'next/navigation'
import { buildAuthUrl, getOAuthConfig } from '@/lib/google-oauth'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  let config
  try {
    config = getOAuthConfig(baseUrl)
  } catch {
    return new Response(
      'OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
      { status: 503 },
    )
  }

  const url = buildAuthUrl(config, slug)
  return redirect(url.toString())
}
