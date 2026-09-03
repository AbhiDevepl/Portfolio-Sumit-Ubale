import { useMemo, useRef, useState } from 'react'
import { useGalleryFilter } from '../../hooks/useGalleryFilter'
import { usePortfolioData } from '../../hooks/usePortfolioData'
import { useReveal } from '../../hooks/useReveal'
import { CATEGORY_LABELS, HOME_CATEGORIES } from '../../lib/categories'
import type { GalleryItem } from '../../types/portfolio'
import { CategoryFilter } from '../gallery/CategoryFilter'

/** Images added per "Load More" click, matching the static page. */
const IMAGE_BATCH = 3

/**
 * The home page portfolio teaser: a shuffled, deduplicated sample of the
 * whole portfolio behind category chips, with progressive disclosure.
 *
 * Ported from the inline gallery script in index.html — same batch sizes,
 * same cinematics behaviour (one video at a time), same shuffle-on-load.
 */
export function PortfolioSection() {
  const gridRef = useRef<HTMLDivElement>(null)
  const [category, setCategory] = useState<string>('all')
  const [batches, setBatches] = useState(0)

  const { data } = usePortfolioData()
  const { items } = useGalleryFilter(data, category, { order: 'random', dedupe: true })

  const images = useMemo(() => items.filter(item => item.type === 'image'), [items])
  const videos = useMemo(() => items.filter(item => item.type === 'video'), [items])

  const isCinematics = category === 'cinematics'
  const isAll = category === 'all'

  const { visible, hasMore } = useMemo(() => {
    if (isCinematics) {
      // One video at a time: "Load More" replaces rather than appends.
      const video = videos[batches]
      return {
        visible: video ? [video] : [],
        hasMore: batches + 1 < videos.length,
      }
    }

    const shown: GalleryItem[] = images.slice(0, IMAGE_BATCH)
    // Every category except "all" leads with one moving image.
    if (!isAll && videos[0]) shown.push(videos[0])
    shown.push(...images.slice(IMAGE_BATCH, IMAGE_BATCH + IMAGE_BATCH * batches))

    return {
      visible: shown,
      // "All" is a taster: it never offers more.
      hasMore: !isAll && shown.filter(item => item.type === 'image').length < images.length,
    }
  }, [images, videos, batches, isAll, isCinematics])

  useReveal(gridRef, '.portfolio-item', { y: 34, stagger: 0.055 }, [visible.length, category])

  const onSelect = (next: string) => {
    if (next === category) return
    setCategory(next)
    setBatches(0)
  }

  return (
    <section className="portfolio section" id="portfolio">
      <div className="container">
        <div className="portfolio-header">
          <h2 className="portfolio-title">Portfolio</h2>
        </div>

        <div className="portfolio-filter-shell">
          <CategoryFilter
            categories={HOME_CATEGORIES}
            active={category}
            onSelect={onSelect}
            labels={CATEGORY_LABELS}
          />
        </div>

        <div
          ref={gridRef}
          className={`portfolio-grid portfolio-inline-grid${isCinematics ? ' cinematics-mode' : ''}`}
          role="region"
          aria-label="Photography gallery"
        >
          {visible.length === 0
            ? <p className="gallery-empty-inline">No work in this category yet.</p>
            : visible.map(item => (
                <div className="portfolio-item" data-type={item.type} key={item.src}>
                  {item.type === 'video'
                    ? (
                        <video
                          src={item.src}
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          onMouseEnter={e => void e.currentTarget.play().catch(() => {})}
                          onMouseLeave={e => e.currentTarget.pause()}
                        />
                      )
                    : (
                        <img
                          src={item.src}
                          alt={item.alt || item.title || 'Portfolio image'}
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                </div>
              ))}
        </div>

        {hasMore && (
          <div className="portfolio-more">
            <button
              className="learn-more-btn"
              type="button"
              onClick={() => setBatches(count => count + 1)}
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
