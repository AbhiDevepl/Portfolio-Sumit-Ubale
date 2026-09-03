import { useState } from 'react'
import type { B2File } from '../../lib/b2'
import { displayName, formatBytes } from '../../lib/b2'

export function MediaCard({ file, onDelete }: {
  file: B2File
  onDelete: (file: B2File) => Promise<void>
}) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [failed, setFailed] = useState(false)

  const remove = async () => {
    setDeleting(true)
    setFailed(false)
    try {
      await onDelete(file)
    }
    catch {
      // The panel surfaces the message; the card just stops pretending.
      setFailed(true)
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <li className={`media-card${deleting ? ' is-deleting' : ''}`}>
      <div className="media-preview">
        {file.kind === 'video'
          ? (
              // preload="metadata" so the poster frame arrives without pulling
              // the whole file down.
              <video src={file.url} controls preload="metadata" playsInline />
            )
          : (
              <img src={file.url} alt={displayName(file)} loading="lazy" decoding="async" />
            )}
      </div>

      <div className="media-meta">
        <p className="media-name" title={file.fileName}>{displayName(file)}</p>
        <p className="media-detail">
          {formatBytes(file.size)}
          {' · '}
          {new Date(file.uploadedAt).toLocaleDateString()}
        </p>
        {failed && <p className="media-detail is-error">Delete failed</p>}
      </div>

      {confirming
        ? (
            <div className="media-confirm">
              <button className="admin-button is-danger" type="button" disabled={deleting} onClick={remove}>
                {deleting ? 'Deleting…' : 'Confirm'}
              </button>
              <button className="admin-button is-quiet" type="button" disabled={deleting} onClick={() => setConfirming(false)}>
                Cancel
              </button>
            </div>
          )
        : (
            <button
              className="admin-button is-quiet"
              type="button"
              onClick={() => setConfirming(true)}
            >
              Delete
            </button>
          )}
    </li>
  )
}
