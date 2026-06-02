import { createClient } from '@supabase/supabase-js'
import { exchangeCodeForTokens, getOAuthConfig } from '@/lib/google-oauth'
import { SupabaseVaultTokenStore } from '@/services/artist-token-store'

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  return createClient(url, key)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const slug = searchParams.get('state')
  const oauthError = searchParams.get('error')

  if (oauthError) {
    return html(errorPage(`Google authorization denied: ${oauthError}`), 400)
  }

  if (!code || !slug) {
    return html(errorPage('Missing code or state parameter.'), 400)
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  let config
  try {
    config = getOAuthConfig(baseUrl)
  } catch (err) {
    console.error('[inkbook] OAuth callback: missing OAuth env vars:', err)
    return html(errorPage('Server configuration error. Please contact support.'), 500)
  }

  let tokens
  try {
    tokens = await exchangeCodeForTokens(config, code)
  } catch (err) {
    console.error('[inkbook] OAuth callback: Google token exchange failed:', err)
    return html(errorPage('Failed to exchange authorization code with Google. Please try again.'), 500)
  }

  if (!tokens.refresh_token) {
    return html(
      errorPage(
        'No refresh token received. Revoke app access in your Google account settings and try again.',
      ),
      400,
    )
  }

  try {
    const store = new SupabaseVaultTokenStore(getSupabaseAdmin() as never)
    await store.saveRefreshToken(slug, tokens.refresh_token)
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    console.error(`[inkbook] OAuth callback: Supabase write failed for slug="${slug}": ${detail}`, err)
    return html(errorPage('Failed to save calendar connection. Please try again.'), 500)
  }

  return html(successPage(), 200)
}

function html(body: string, status: number) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html' } })
}

function successPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Calendar Connected — inkbook</title>
  <style>
    body{background:#000;color:#F5F0E8;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
    .card{text-align:center;max-width:420px;padding:2.5rem}
    h1{color:#C9A96E;font-weight:300;font-size:2rem;margin:0 0 .75rem}
    p{color:#6B6560;font-size:.95rem;margin:0}
    svg{display:block;margin:0 auto 1.5rem}
  </style>
</head>
<body>
  <div class="card">
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <circle cx="26" cy="26" r="25" stroke="#22c55e" stroke-width="2"/>
      <path d="M15 26l8 8 14-14" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <h1>Calendar connected successfully.</h1>
    <p>Google Calendar is now linked to your inkbook profile. You can close this window.</p>
  </div>
</body>
</html>`
}

function errorPage(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Connection Failed — inkbook</title>
  <style>
    body{background:#000;color:#F5F0E8;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
    .card{text-align:center;max-width:420px;padding:2.5rem}
    h1{color:#ef4444;font-weight:300;font-size:1.75rem;margin:0 0 .75rem}
    p{color:#6B6560;font-size:.875rem;margin:0}
  </style>
</head>
<body>
  <div class="card">
    <h1>Connection failed.</h1>
    <p>${message}</p>
  </div>
</body>
</html>`
}
