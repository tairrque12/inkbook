import { createClient } from '@supabase/supabase-js'
import { verifySessionToken, cookieName, hashPassword } from './admin-auth'

export function getAdminSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  return createClient(url, key)
}

// Returns the bcrypt hash for the given slug from artist_admins table.
// On first call, seeds from ADMIN_PASSWORD env var if no row exists.
export async function getOrSeedPasswordHash(slug: string): Promise<string | null> {
  const db = getAdminSupabase()

  const { data } = await db
    .from('artist_admins')
    .select('password_hash')
    .eq('slug', slug)
    .single()

  if (data?.password_hash) return data.password_hash

  // Auto-seed from env var on first login
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return null

  const hash = await hashPassword(adminPassword)
  await db.from('artist_admins').upsert({ slug, password_hash: hash })
  return hash
}

export async function requireAuth(req: Request, slug: string): Promise<boolean> {
  const cookieHeader = req.headers.get('cookie') ?? ''
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=')
      return [k, v.join('=')]
    })
  )
  const token = cookies[cookieName(slug)] ?? ''
  return verifySessionToken(token, slug)
}
