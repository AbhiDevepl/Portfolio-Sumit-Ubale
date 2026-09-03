/**
 * Client-side B2 media layer.
 *
 * Every B2 operation goes through a Netlify Function — no credentials, bucket
 * ids or account tokens exist in this bundle. The admin panel is the only
 * consumer today; the public gallery can call `listMedia()` later without
 * duplicating any of this.
 */

export interface B2File {
  fileId: string
  /** Object key, e.g. `images/haldi-3f1a9c.jpg`. */
  fileName: string
  contentType: string
  size: number
  /** Epoch milliseconds. */
  uploadedAt: number
  kind: 'image' | 'video'
  /** Time-limited download URL; safe as an <img>/<video> src. */
  url: string
}

/** Thrown when the session is missing or has expired. */
export class SessionError extends Error {
  constructor(message = 'Your session has expired. Please sign in again.') {
    super(message)
    this.name = 'SessionError'
  }
}

export const ACCEPTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'mov'] as const
export const ACCEPT_ATTRIBUTE = ACCEPTED_EXTENSIONS.map(ext => `.${ext}`).join(',')
export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024

const FN = '/.netlify/functions'

async function callFunction<T>(name: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${FN}/${name}`, { credentials: 'same-origin', ...init })
  }
  catch {
    throw new Error('Network error — check your connection and try again.')
  }

  if (response.status === 401) throw new SessionError()

  const payload = await response.json().catch(() => null) as { error?: string } | null
  if (!response.ok) {
    throw new Error(payload?.error ?? `Request failed (${response.status})`)
  }
  return payload as T
}

export async function login(password: string): Promise<void> {
  await callFunction('admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
}

export async function logout(): Promise<void> {
  await callFunction('admin-logout', { method: 'POST' })
}

export async function listMedia(): Promise<B2File[]> {
  const { files } = await callFunction<{ files: B2File[] }>('b2-list')
  return files
}

export async function deleteMedia(file: B2File): Promise<void> {
  await callFunction('b2-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId: file.fileId, fileName: file.fileName }),
  })
}

export function isAcceptedFile(file: File): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  return (ACCEPTED_EXTENSIONS as readonly string[]).includes(extension)
}

interface UploadTarget {
  uploadUrl: string
  authorizationToken: string
  key: string
  contentType: string
}

/**
 * Uploads straight to B2 using a one-shot target the function hands out.
 *
 * A Netlify Function request body is capped around 6 MB, so proxying a video
 * through one is not possible. The server still decides the object key and
 * content type, and validates the extension before issuing the target.
 *
 * XHR rather than fetch: it is still the only way to get upload progress.
 */
export async function uploadMedia(file: File, onProgress: (fraction: number) => void): Promise<void> {
  if (!isAcceptedFile(file)) {
    throw new Error(`${file.name}: unsupported file type`)
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`${file.name}: larger than the ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB limit`)
  }

  const target = await callFunction<UploadTarget>('b2-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: file.name, size: file.size }),
  })

  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', target.uploadUrl)
    request.setRequestHeader('Authorization', target.authorizationToken)
    request.setRequestHeader('X-Bz-File-Name', encodeURI(target.key))
    request.setRequestHeader('Content-Type', target.contentType)
    // B2 requires a checksum header; hashing a 500 MB video in the browser
    // would mean reading it all into memory first.
    request.setRequestHeader('X-Bz-Content-Sha1', 'do_not_verify')

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total)
    })
    request.addEventListener('load', () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress(1)
        resolve()
      }
      else {
        reject(new Error(`${file.name}: upload failed (${request.status})`))
      }
    })
    request.addEventListener('error', () => reject(new Error(`${file.name}: upload failed`)))
    request.addEventListener('abort', () => reject(new Error(`${file.name}: upload cancelled`)))
    request.send(file)
  })
}

/** `images/haldi-3f1a9c.jpg` -> `haldi-3f1a9c.jpg` */
export function displayName(file: B2File): string {
  return file.fileName.split('/').pop() ?? file.fileName
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
