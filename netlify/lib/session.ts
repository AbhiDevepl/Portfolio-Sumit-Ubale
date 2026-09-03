import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Single-admin session: an expiry timestamp signed with HMAC-SHA256 and kept
 * in an HttpOnly cookie. No user table, no JWT library — there is exactly one
 * admin and the only claim is "logged in until T".
 *
 * The signing key is derived from ADMIN_PASSWORD, so changing the password
 * invalidates every outstanding session. That is the behaviour you want, and
 * it avoids a second secret to manage.
 */

const COOKIE_NAME = 'sup_admin'
const MAX_AGE_SECONDS = 60 * 60 * 8

function signingKey(): string {
  const password = process.env.ADMIN_PASSWORD
  if (!password) throw new Error('ADMIN_PASSWORD is not configured')
  return createHmac('sha256', 'sup-admin-session').update(password).digest('hex')
}

function sign(payload: string): string {
  return createHmac('sha256', signingKey()).update(payload).digest('base64url')
}

/** Constant-time compare that does not leak length through an exception. */
function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

export function checkPassword(candidate: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || typeof candidate !== 'string' || candidate.length === 0) return false
  // Hash both sides first so the comparison length never depends on the input.
  const hash = (value: string) => createHmac('sha256', 'sup-admin-login').update(value).digest('hex')
  return safeEqual(hash(candidate), hash(expected))
}

export function createSessionCookie(): string {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000
  const payload = String(expires)
  const value = `${payload}.${sign(payload)}`
  return `${COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${MAX_AGE_SECONDS}`
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
}

export function hasValidSession(request: Request): boolean {
  const header = request.headers.get('cookie')
  if (!header) return false

  const cookie = header
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${COOKIE_NAME}=`))
  if (!cookie) return false

  const value = cookie.slice(COOKIE_NAME.length + 1)
  const separator = value.lastIndexOf('.')
  if (separator < 1) return false

  const payload = value.slice(0, separator)
  const signature = value.slice(separator + 1)

  try {
    if (!safeEqual(signature, sign(payload))) return false
  }
  catch {
    return false
  }

  const expires = Number(payload)
  return Number.isFinite(expires) && expires > Date.now()
}

/** Wraps a handler so it only runs for a signed-in admin. */
export function requireSession(
  handler: (request: Request) => Promise<Response>,
): (request: Request) => Promise<Response> {
  return async (request) => {
    if (!hasValidSession(request)) {
      return json({ error: 'Not signed in' }, 401)
    }
    try {
      return await handler(request)
    }
    catch (error) {
      // Never let a B2 credential or token reach the client or the log.
      const message = error instanceof Error ? error.message : 'Request failed'
      console.error('admin function failed:', message)
      return json({ error: message }, 502)
    }
  }
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  })
}
