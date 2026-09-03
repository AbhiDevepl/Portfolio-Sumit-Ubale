import { useRef } from 'react'
import { useReveal } from '../../hooks/useReveal'
import { formatCategoryName } from '../../lib/site'
import type { LightboxItem } from '../../types/portfolio'
import { GalleryItem } from './GalleryItem'

/**
 * The grid itself. One IntersectionObserver-driven reveal owns every tile —
 * there is deliberately no second animation pass writing the same opacity.
 */
export function GalleryGrid({ items, category, onOpen, centered = false }: {
  items: LightboxItem[]
  category?: string
  onOpen: (index: number) => void
  /** Single-column centered layout, used for cinematics/video sets. */
  centered?: boolean
}) {
  const gridRef = useRef<HTMLDivElement>(null)

  useReveal(
    gridRef,
    '.gallery-item',
    { y: 36, duration: 0.75, stagger: 0.045 },
    [items],
  )

  if (!items.length) {
    const label = category && category !== 'all' ? formatCategoryName(category) : null
    return (
      <div className="gallery-grid" role="list">
        <div className="gallery-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <h3>Nothing here yet</h3>
          <p>
            {label
              ? `No ${label} work has been published yet.`
              : 'No work has been published yet.'}
            {' '}
            Try another category.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={gridRef}
      className={`gallery-grid${centered ? ' layout-centered' : ''}`}
      role="list"
      aria-label="Portfolio items"
    >
      {items.map((item, index) => (
        <GalleryItem
          key={`${item.category ?? ''}-${item.src}-${index}`}
          item={item}
          index={index}
          onOpen={onOpen}
        />
      ))}
    </div>
  )
}
