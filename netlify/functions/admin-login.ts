import { checkPassword, createSessionCookie, json } from '../lib/session'

/** POST { password } -> sets the HttpOnly session cookie. */
export default async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let body: { password?: unknown }
  try {
    body = await request.json() as { password?: unknown }
  }
  catch {
    return json({ error: 'Invalid request' }, 400)
  }

  if (!process.env.ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD is not configured')
    return json({ error: 'Admin access is not configured' }, 503)
  }

  if (!checkPassword(body.password)) {
    return json({ error: 'Incorrect password' }, 401)
  }

  return json({ ok: true }, 200, { 'Set-Cookie': createSessionCookie() })
}
