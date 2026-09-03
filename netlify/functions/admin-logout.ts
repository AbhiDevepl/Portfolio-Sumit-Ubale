import { clearSessionCookie, json } from '../lib/session'

/** POST -> clears the session cookie. The cookie is HttpOnly, so only the
 *  server can remove it. */
export default async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie() })
}
