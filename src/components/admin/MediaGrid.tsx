import type { B2File } from '../../lib/b2'
import { MediaCard } from './MediaCard'

export function MediaGrid({ title, files, onDelete }: {
  title: string
  files: B2File[]
  onDelete: (file: B2File) => Promise<void>
}) {
  return (
    <section className="media-section">
      <h2 className="media-heading">
        {title}
        {' '}
        <span className="media-count">{files.length}</span>
      </h2>

      {files.length === 0
        ? <p className="admin-empty">Nothing here yet.</p>
        : (
            <ul className="media-grid">
              {files.map(file => (
                <MediaCard key={file.fileId} file={file} onDelete={onDelete} />
              ))}
            </ul>
          )}
    </section>
  )
}
