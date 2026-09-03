import { useCallback, useMemo, useState } from 'react'
import type { B2File } from '../../lib/b2'
import { deleteMedia, isAcceptedFile, listMedia, logout, SessionError, uploadMedia } from '../../lib/b2'
import { MediaGrid } from './MediaGrid'
import type { UploadProgress } from './UploadZone'
import { UploadZone } from './UploadZone'

export function AdminPanel({ initialFiles, onSignedOut }: {
  /** Fetched by the route's session probe, so the panel needs no mount fetch. */
  initialFiles: B2File[]
  onSignedOut: () => void
}) {
  const [files, setFiles] = useState<B2File[] | null>(initialFiles)
  const [error, setError] = useState<string | null>(null)
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const [uploading, setUploading] = useState(false)

  /** Any 401 means the session lapsed: drop straight back to the login form. */
  const handle = useCallback((cause: unknown) => {
    if (cause instanceof SessionError) {
      onSignedOut()
      return
    }
    setError(cause instanceof Error ? cause.message : 'Something went wrong')
  }, [onSignedOut])

  const refresh = useCallback(async () => {
    try {
      setFiles(await listMedia())
      setError(null)
    }
    catch (cause) {
      handle(cause)
    }
  }, [handle])

  const onFiles = async (chosen: File[]) => {
    setError(null)

    const rejected = chosen.filter(file => !isAcceptedFile(file))
    const accepted = chosen.filter(isAcceptedFile)

    setUploads([
      ...accepted.map(file => ({ name: file.name, fraction: 0 })),
      ...rejected.map(file => ({ name: file.name, fraction: 0, error: 'Unsupported file type' })),
    ])

    if (accepted.length === 0) return

    setUploading(true)
    let sessionLost = false

    // Sequential: a photographer dropping twenty frames at once should not
    // open twenty concurrent uploads to B2.
    for (const file of accepted) {
      try {
        await uploadMedia(file, (fraction) => {
          setUploads(current => current.map(entry =>
            entry.name === file.name ? { ...entry, fraction } : entry,
          ))
        })
      }
      catch (cause) {
        if (cause instanceof SessionError) {
          sessionLost = true
          break
        }
        setUploads(current => current.map(entry =>
          entry.name === file.name
            ? { ...entry, error: cause instanceof Error ? cause.message : 'Upload failed' }
            : entry,
        ))
      }
    }

    setUploading(false)

    if (sessionLost) {
      onSignedOut()
      return
    }

    await refresh()
    // Leave failures on screen; clear the rows that succeeded.
    setUploads(current => current.filter(entry => entry.error))
  }

  const onDelete = async (file: B2File) => {
    try {
      await deleteMedia(file)
      setFiles(current => current?.filter(entry => entry.fileId !== file.fileId) ?? null)
      setError(null)
    }
    catch (cause) {
      handle(cause)
      throw cause
    }
  }

  const onLogout = async () => {
    try {
      await logout()
    }
    finally {
      onSignedOut()
    }
  }

  const { images, videos } = useMemo(() => ({
    images: files?.filter(file => file.kind === 'image') ?? [],
    videos: files?.filter(file => file.kind === 'video') ?? [],
  }), [files])

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1 className="admin-title">Admin</h1>
        <button className="admin-button is-quiet" type="button" onClick={() => void refresh()}>
          Refresh
        </button>
      </header>

      {error && <p className="admin-error" role="alert">{error}</p>}

      <UploadZone onFiles={files_ => void onFiles(files_)} uploads={uploads} busy={uploading} />

      {files === null
        ? <p className="admin-empty">Loading files…</p>
        : (
            <>
              <MediaGrid title="Images" files={images} onDelete={onDelete} />
              <MediaGrid title="Videos" files={videos} onDelete={onDelete} />
            </>
          )}

      <footer className="admin-footer">
        <button className="admin-button is-quiet" type="button" onClick={() => void onLogout()}>
          Logout
        </button>
      </footer>
    </div>
  )
}
