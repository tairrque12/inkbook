import * as bcrypt from 'bcryptjs'

const COOKIE_NAME = 'inkbook-admin'
const TTL_MS = 24 * 60 * 60 * 1000  // 24 hours

function getSecret(): string {
  return process.env.ADMIN_TOKEN_SECRET ?? process.env.ADMIN_PASSWORD ?? 'dev-secret'
}

async function hmacSign(payload: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  return Buffer.from(sig).toString('base64url')
}

async function hmacVerify(payload: string, sig: string): Promise<boolean> {
  const expected = await hmacSign(payload)
  return expected === sig
}

export async function createSessionToken(slug: string): Promise<string> {
  const expiresAt = Date.now() + TTL_MS
  const payload = `${slug}:${expiresAt}`
  const sig = await hmacSign(payload)
  return `${Buffer.from(payload).toString('base64url')}.${sig}`
}

export async function verifySessionToken(token: string, slug: string): Promise<boolean> {
  try {
    const [b64, sig] = token.split('.')
    if (!b64 || !sig) return false
    const payload = Buffer.from(b64, 'base64url').toString('utf8')
    const [tokenSlug, expiresAtStr] = payload.split(':')
    if (tokenSlug !== slug) return false
    if (Date.now() > parseInt(expiresAtStr, 10)) return false
    return hmacVerify(payload, sig)
  } catch {
    return false
  }
}

export function cookieName(slug: string): string {
  return `${COOKIE_NAME}-${slug}`
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
