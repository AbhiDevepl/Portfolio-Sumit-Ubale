import { useRef, useState } from 'react'
import { ACCEPT_ATTRIBUTE, ACCEPTED_EXTENSIONS } from '../../lib/b2'

export interface UploadProgress {
  name: string
  fraction: number
  error?: string
}

export function UploadZone({ onFiles, uploads, busy }: {
  onFiles: (files: File[]) => void
  uploads: UploadProgress[]
  busy: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const accept = (list: FileList | null) => {
    const files = Array.from(list ?? [])
    if (files.length) onFiles(files)
  }

  return (
    <section className="admin-upload">
      <div
        className={`upload-zone${dragging ? ' is-dragging' : ''}`}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          accept(event.dataTransfer.files)
        }}
      >
        <p className="upload-hint">Drop files here</p>
        <button
          className="admin-button"
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? 'Uploading…' : 'Upload Files'}
        </button>
        <p className="upload-types">{ACCEPTED_EXTENSIONS.join(' · ')}</p>

        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          multiple
          accept={ACCEPT_ATTRIBUTE}
          onChange={(event) => {
            accept(event.target.files)
            // Allows re-picking the same file after a failure.
            event.target.value = ''
          }}
        />
      </div>

      {uploads.length > 0 && (
        <ul className="upload-list">
          {uploads.map(upload => (
            <li key={upload.name} className={upload.error ? 'is-failed' : ''}>
              <span className="upload-name">{upload.name}</span>
              {upload.error
                ? <span className="upload-status">{upload.error}</span>
                : (
                    <>
                      <span className="upload-bar" aria-hidden="true">
                        <span className="upload-bar-fill" style={{ width: `${Math.round(upload.fraction * 100)}%` }} />
                      </span>
                      <span className="upload-status">{Math.round(upload.fraction * 100)}%</span>
                    </>
                  )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
