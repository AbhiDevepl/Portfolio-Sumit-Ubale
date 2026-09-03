import { buildObjectKey, createUploadTarget, MAX_UPLOAD_BYTES } from '../lib/b2'
import { json, requireSession } from '../lib/session'

/**
 * POST { fileName, size } -> a one-shot B2 upload target.
 *
 * The server decides the object key and the content type from its own
 * extension allowlist; whatever MIME type the browser claimed is ignored.
 */
export default requireSession(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let body: { fileName?: unknown, size?: unknown }
  try {
    body = await request.json() as { fileName?: unknown, size?: unknown }
  }
  catch {
    return json({ error: 'Invalid request' }, 400)
  }

  const size = Number(body.size)
  if (!Number.isFinite(size) || size <= 0) {
    return json({ error: 'A file size is required' }, 400)
  }
  if (size > MAX_UPLOAD_BYTES) {
    return json({ error: `File is larger than the ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB limit` }, 413)
  }

  let target: { key: string, contentType: string }
  try {
    target = buildObjectKey(body.fileName)
  }
  catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unsupported file' }, 415)
  }

  const upload = await createUploadTarget()

  return json({
    uploadUrl: upload.uploadUrl,
    authorizationToken: upload.authorizationToken,
    key: target.key,
    contentType: target.contentType,
  })
})
