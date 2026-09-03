import { deleteFile } from '../lib/b2'
import { json, requireSession } from '../lib/session'

/** POST { fileId, fileName } -> removes the object. */
export default requireSession(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let body: { fileId?: unknown, fileName?: unknown }
  try {
    body = await request.json() as { fileId?: unknown, fileName?: unknown }
  }
  catch {
    return json({ error: 'Invalid request' }, 400)
  }

  await deleteFile(body.fileId, body.fileName)
  return json({ ok: true })
})
