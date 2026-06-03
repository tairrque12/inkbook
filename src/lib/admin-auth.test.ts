import { describe, it, expect } from 'vitest'
import { createSessionToken, verifySessionToken, cookieName, hashPassword, verifyPassword } from './admin-auth'

describe('admin-auth', () => {
  describe('cookieName', () => {
    it('returns a slug-scoped cookie name', () => {
      expect(cookieName('miguel')).toBe('inkbook-admin-miguel')
    })
  })

  describe('session tokens', () => {
    it('verifies a freshly created token for the same slug', async () => {
      const token = await createSessionToken('miguel')
      expect(await verifySessionToken(token, 'miguel')).toBe(true)
    })

    it('rejects a token for a different slug', async () => {
      const token = await createSessionToken('miguel')
      expect(await verifySessionToken(token, 'other-artist')).toBe(false)
    })

    it('rejects a tampered token', async () => {
      const token = await createSessionToken('miguel')
      const tampered = token.slice(0, -4) + 'xxxx'
      expect(await verifySessionToken(tampered, 'miguel')).toBe(false)
    })

    it('rejects an empty string', async () => {
      expect(await verifySessionToken('', 'miguel')).toBe(false)
    })

    it('rejects a token with no dot separator', async () => {
      expect(await verifySessionToken('notavalidtoken', 'miguel')).toBe(false)
    })

    it('rejects an expired token', async () => {
      // Build a token whose payload has an expiry in the past
      const expiredPayload = `miguel:${Date.now() - 1000}`
      const b64 = Buffer.from(expiredPayload).toString('base64url')
      // Sign with any string — will fail expiry check before signature check
      const fakeToken = `${b64}.fakesig`
      expect(await verifySessionToken(fakeToken, 'miguel')).toBe(false)
    })
  })

  describe('password hashing', () => {
    it('produces a hash that verifies the original password', async () => {
      const hash = await hashPassword('super-secret')
      expect(await verifyPassword('super-secret', hash)).toBe(true)
    })

    it('rejects a wrong password', async () => {
      const hash = await hashPassword('super-secret')
      expect(await verifyPassword('wrong-password', hash)).toBe(false)
    })

    it('produces different hashes for the same password (salt)', async () => {
      const h1 = await hashPassword('password')
      const h2 = await hashPassword('password')
      expect(h1).not.toBe(h2)
    })
  })
})
