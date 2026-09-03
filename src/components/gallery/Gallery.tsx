import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { GalleryOrder } from '../../hooks/useGalleryFilter'
import { useGalleryFilter } from '../../hooks/useGalleryFilter'
import { useLightbox } from '../../hooks/useLightbox'
import { usePortfolioData } from '../../hooks/usePortfolioData'
import { CATEGORY_LABELS } from '../../lib/categories'
import type { FilterVariant } from './CategoryFilter'
import { CategoryFilter } from './CategoryFilter'
import { GalleryGrid } from './GalleryGrid'
import { Lightbox } from './Lightbox'

/**
 * The consolidated gallery: data, filter chips, grid and lightbox in one
 * place. It replaces the three separate implementations the static site had
 * (content-loader.js, gallery-loader.js, portfolio-gallery.js).
 *
 * The active category lives in the `?category=` query string so a filtered
 * view stays shareable, exactly as before.
 */
export function Gallery({
  categories: categoriesProp,
  variant = 'buttons',
  labels: labelsProp,
  order = 'source',
  dedupe = false,
}: {
  /** Curated chip set. Omit to use every category in portfolio.json. */
  categories?: readonly string[]
  variant?: FilterVariant
  labels?: Record<string, string>
  order?: GalleryOrder
  dedupe?: boolean
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data, isPending, isError, error, refetch } = usePortfolioData()

  const categories = categoriesProp
    ?? data?.portfolio.categories.map(entry => entry.slug)
    ?? ['all']

  const labels = labelsProp
    ?? (data
      ? Object.fromEntries(data.portfolio.categories.map(entry => [entry.slug, entry.name]))
      : CATEGORY_LABELS)

  const requested = searchParams.get('category') ?? searchParams.get('c')
  // Matched case-insensitively: inbound links from the old site used
  // ?category=Cinematics, which matched no chip and silently showed
  // everything. A slug that is still unknown falls back to "all" rather than
  // rendering an empty grid with no explanation.
  const category = categories.find(slug => slug.toLowerCase() === requested?.toLowerCase()) ?? 'all'

  const { items } = useGalleryFilter(data, category, { order, dedupe })
  const lightbox = useLightbox(items)

  const selectCategory = useCallback((next: string) => {
    setSearchParams((params) => {
      const updated = new URLSearchParams(params)
      updated.delete('c')
      if (next === 'all') updated.delete('category')
      else updated.set('category', next)
      return updated
    }, { replace: false })
  }, [setSearchParams])

  return (
    <>
      <CategoryFilter
        categories={categories}
        active={category}
        onSelect={selectCategory}
        variant={variant}
        labels={labels}
      />

      {isPending && (
        <div className="gallery-grid" role="list">
          <div className="gallery-loading-state">
            <div className="gallery-loading-spinner" />
            <p>Loading portfolio...</p>
          </div>
        </div>
      )}

      {isError && (
        <div className="gallery-grid" role="list">
          <div className="gallery-error-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
            <h3>Failed to load portfolio</h3>
            <p>{error instanceof Error ? error.message : 'Unable to load portfolio. Please check your connection and try again.'}</p>
            <button className="gallery-retry-btn" type="button" onClick={() => void refetch()}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {!isPending && !isError && (
        <GalleryGrid
          items={items}
          category={category}
          centered={category === 'cinematics'}
          onOpen={index => lightbox.open(index, items)}
        />
      )}

      <Lightbox controller={lightbox} />
    </>
  )
}
