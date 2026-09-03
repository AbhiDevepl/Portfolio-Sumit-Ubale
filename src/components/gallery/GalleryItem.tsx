import { useRef, useState } from 'react'
import { formatCategoryName } from '../../lib/site'
import type { LightboxItem } from '../../types/portfolio'
import { VideoItem } from './VideoItem'

/**
 * One tile in the grid. Replaces Core.Media.createItem() from core.js and the
 * duplicate GalleryRenderer.createGalleryItem() from portfolio-gallery.js.
 */
export function GalleryItem({ item, index, onOpen }: {
  item: LightboxItem
  index: number
  onOpen: (index: number) => void
}) {
  const articleRef = useRef<HTMLElement>(null)
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading')
  const isVideo = item.type === 'video'

  const className = [
    'gallery-item',
    isVideo ? 'gallery-item--video' : 'gallery-item--image',
    state === 'loading' ? 'loading' : '',
    state === 'loaded' ? 'loaded' : '',
    state === 'error' ? 'media-error' : '',
  ].filter(Boolean).join(' ')

  const open = () => onOpen(index)

  return (
    <article
      ref={articleRef}
      className={className}
      role="listitem"
      tabIndex={0}
      aria-label={`${item.title || 'Open preview'}${item.category ? `, ${formatCategoryName(item.category)}` : ''}`}
      onClick={(e) => {
        // Clicking the video itself toggles playback rather than opening.
        if ((e.target as HTMLElement).tagName === 'VIDEO') return
        open()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          open()
        }
      }}
    >
      {isVideo
        ? (
            <VideoItem
              src={item.src}
              poster={item.poster}
              containerRef={articleRef}
              onLoaded={() => setState('loaded')}
            />
          )
        : (
            <img
              className="gallery-media"
              src={item.src}
              alt={item.alt || item.title || 'Portfolio image'}
              loading="lazy"
              decoding="async"
              onLoad={() => setState('loaded')}
              onError={() => setState('error')}
            />
          )}

      {isVideo && (
        <div className="gallery-video-play-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )}

      <div className="gallery-overlay">
        <h3 className="gallery-item-title">{item.title || ''}</h3>
        <p className="gallery-item-category">{item.category ? formatCategoryName(item.category) : ''}</p>
      </div>
    </article>
  )
}
