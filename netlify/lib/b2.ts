/**
 * Minimal Backblaze B2 client for the admin functions.
 *
 * Uses B2's native API over fetch — no SDK. The alternative (S3-compatible
 * API) would need an AWS SigV4 signer, i.e. a large dependency, to do what
 * four JSON calls do here.
 *
 * Credentials live only in this process. The browser never sees the account
 * key, the account authorization token, or a bucket id.
 */

const AUTH_URL = 'https://api.backblazeb2.com/b2api/v3/b2_authorize_account'

/** Object key prefixes. Extension decides which one a file goes under. */
export const IMAGE_PREFIX = 'images/'
export const VIDEO_PREFIX = 'videos/'

/** Server-side allowlist. The client's declared MIME type is never trusted. */
const TYPES: Record<string, { contentType: string, kind: 'image' | 'video' }> = {
  jpg: { contentType: 'image/jpeg', kind: 'image' },
  jpeg: { contentType: 'image/jpeg', kind: 'image' },
  png: { contentType: 'image/png', kind: 'image' },
  webp: { contentType: 'image/webp', kind: 'image' },
  gif: { contentType: 'image/gif', kind: 'image' },
  mp4: { contentType: 'video/mp4', kind: 'video' },
  webm: { contentType: 'video/webm', kind: 'video' },
  mov: { contentType: 'video/quicktime', kind: 'video' },
}

export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024

interface Authorization {
  apiUrl: string
  downloadUrl: string
  token: string
  expiresAt: number
}

/**
 * Cached across invocations that reuse the same container. B2 tokens are good
 * for 24h; an hour keeps the cache useful without holding a stale token.
 */
let cached: Authorization | null = null

function env(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

async function authorize(): Promise<Authorization> {
  if (cached && cached.expiresAt > Date.now()) return cached

  const basic = Buffer.from(`${env('B2_KEY_ID')}:${env('B2_APPLICATION_KEY')}`).toString('base64')
  const response = await fetch(AUTH_URL, { headers: { Authorization: `Basic ${basic}` } })

  if (!response.ok) {
    // Deliberately terse: the B2 body can echo the key id back.
    throw new Error(`B2 authorization failed (${response.status})`)
  }

  const data = await response.json() as {
    authorizationToken: string
    apiInfo: { storageApi: { apiUrl: string, downloadUrl: string } }
  }

  cached = {
    apiUrl: data.apiInfo.storageApi.apiUrl,
    downloadUrl: data.apiInfo.storageApi.downloadUrl,
    token: data.authorizationToken,
    expiresAt: Date.now() + 60 * 60 * 1000,
  }
  return cached
}

async function call<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const auth = await authorize()
  const response = await fetch(`${auth.apiUrl}/b2api/v3/${path}`, {
    method: 'POST',
    headers: { 'Authorization': auth.token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    if (response.status === 401) cached = null
    const detail = await response.json().catch(() => null) as { code?: string } | null
    throw new Error(`B2 ${path} failed (${response.status}${detail?.code ? `: ${detail.code}` : ''})`)
  }

  return response.json() as Promise<T>
}

export interface B2File {
  fileId: string
  fileName: string
  contentType: string
  size: number
  uploadedAt: number
  kind: 'image' | 'video'
  /** Time-limited download URL, safe to put in an <img>/<video> src. */
  url: string
}

/**
 * Everything under images/ and videos/, newest first, each with a signed
 * preview URL. One download authorization covers the whole bucket, so this is
 * two round trips regardless of how many files there are.
 */
export async function listFiles(): Promise<B2File[]> {
  const auth = await authorize()
  const bucketId = env('B2_BUCKET_ID')
  const bucketName = env('B2_BUCKET_NAME')

  const [download, listing] = await Promise.all([
    call<{ authorizationToken: string }>('b2_get_download_authorization', {
      bucketId,
      fileNamePrefix: '',
      validDurationInSeconds: 60 * 60,
    }),
    call<{ files: { fileId: string, fileName: string, contentType: string, contentLength: number, uploadTimestamp: number, action: string }[] }>(
      'b2_list_file_names',
      { bucketId, maxFileCount: 1000 },
    ),
  ])

  return listing.files
    .filter(file => file.action === 'upload')
    .filter(file => file.fileName.startsWith(IMAGE_PREFIX) || file.fileName.startsWith(VIDEO_PREFIX))
    .map(file => ({
      fileId: file.fileId,
      fileName: file.fileName,
      contentType: file.contentType,
      size: file.contentLength,
      uploadedAt: file.uploadTimestamp,
      kind: file.fileName.startsWith(VIDEO_PREFIX) ? 'video' as const : 'image' as const,
      url: `${auth.downloadUrl}/file/${bucketName}/${file.fileName.split('/').map(encodeURIComponent).join('/')}?Authorization=${download.authorizationToken}`,
    }))
    .sort((a, b) => b.uploadedAt - a.uploadedAt)
}

/**
 * Turns a client-supplied filename into a safe object key.
 * Strips any path, keeps only characters that are unambiguous in a URL, and
 * appends a short random suffix so re-uploading a name never shadows an
 * existing object.
 */
export function buildObjectKey(rawName: unknown): { key: string, contentType: string } {
  if (typeof rawName !== 'string' || rawName.trim() === '') {
    throw new Error('A filename is required')
  }

  // Defeats ../ and \..\ and any directory component the client sends.
  const base = rawName.replace(/\\/g, '/').split('/').pop() ?? ''
  const dot = base.lastIndexOf('.')
  const extension = dot > 0 ? base.slice(dot + 1).toLowerCase() : ''

  const type = TYPES[extension]
  if (!type) {
    throw new Error(`Unsupported file type ".${extension}" — allowed: ${Object.keys(TYPES).join(', ')}`)
  }

  const stem = base
    .slice(0, dot)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'file'

  const suffix = Math.random().toString(16).slice(2, 8)
  const prefix = type.kind === 'video' ? VIDEO_PREFIX : IMAGE_PREFIX

  return { key: `${prefix}${stem}-${suffix}.${extension}`, contentType: type.contentType }
}

/**
 * A single-use upload target the browser posts the file straight to.
 *
 * Netlify caps a function request body at ~6 MB, so proxying video uploads
 * through the function is not an option. The token this returns is scoped to
 * one bucket and short-lived; the account key stays on the server.
 */
export async function createUploadTarget(): Promise<{ uploadUrl: string, authorizationToken: string }> {
  return call<{ uploadUrl: string, authorizationToken: string }>('b2_get_upload_url', {
    bucketId: env('B2_BUCKET_ID'),
  })
}

export async function deleteFile(fileId: unknown, fileName: unknown): Promise<void> {
  if (typeof fileId !== 'string' || typeof fileName !== 'string' || !fileId || !fileName) {
    throw new Error('fileId and fileName are required')
  }
  if (!fileName.startsWith(IMAGE_PREFIX) && !fileName.startsWith(VIDEO_PREFIX)) {
    throw new Error('Refusing to delete an object outside images/ and videos/')
  }
  await call('b2_delete_file_version', { fileId, fileName })
}
