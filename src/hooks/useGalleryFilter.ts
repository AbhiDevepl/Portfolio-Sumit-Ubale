import { useMemo } from 'react'
import type { GalleryItem, PortfolioData } from '../types/portfolio'

/**
 * The one filter engine. It replaces the three duplicated implementations in
 * the old content-loader.js / gallery-loader.js / portfolio-gallery.js.
 */

/** Curated category order, ported from portfolio-gallery.js. */
const CATEGORY_ORDER = [
  'weddings',
  'pre-wedding-photos-and-videos',
  'engagement',
  'haldi',
  'maternity',
  'portraits',
  'cinematics',
  'kids',
  'events',
  'commercial',
]

export type GalleryOrder =
  /** The order the categories appear in portfolio.json. */
  | 'source'
  /** CATEGORY_ORDER above, then each category's own order. */
  | 'curated'
  /** Shuffled once per data load, so every visit leads with different work. */
  | 'random'

export interface GalleryFilterOptions {
  order?: GalleryOrder
  /** Drop repeats of the same image across categories. */
  dedupe?: boolean
}

/** Flattens `portfolio.images` into a single list, tagging each item's category. */
export function flattenPortfolio(data: PortfolioData): GalleryItem[] {
  return Object.entries(data.portfolio.images).flatMap(([category, items]) =>
    items.map(item => ({ ...item, category })),
  )
}

function shuffle<T>(items: T[]): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    // noUncheckedIndexedAccess: both indices are in range by construction.
    ;[out[i], out[j]] = [out[j] as T, out[i] as T]
  }
  return out
}

function sortCurated(items: GalleryItem[]): GalleryItem[] {
  const positions = new Map(items.map((item, index) => [item, index]))
  return items.slice().sort((a, b) => {
    const catA = CATEGORY_ORDER.indexOf(a.category)
    const catB = CATEGORY_ORDER.indexOf(b.category)
    if (catA !== catB) return catA - catB
    return (positions.get(a) ?? 0) - (positions.get(b) ?? 0)
  })
}

/**
 * @param category a category slug, or `all` for everything.
 */
export function useGalleryFilter(
  data: PortfolioData | undefined,
  category: string,
  { order = 'source', dedupe = false }: GalleryFilterOptions = {},
) {
  // Flatten/sort/dedupe depend only on the data, so a filter click never
  // redoes them — and `random` keeps the same shuffle while browsing.
  const all = useMemo(() => {
    if (!data) return []

    let items = flattenPortfolio(data)

    if (dedupe) {
      const seen = new Set<string>()
      items = items.filter(item => {
        if (seen.has(item.src)) return false
        seen.add(item.src)
        return true
      })
    }

    if (order === 'curated') return sortCurated(items)
    if (order === 'random') return shuffle(items)
    return items
  }, [data, order, dedupe])

  const items = useMemo(
    () => (category === 'all' ? all : all.filter(item => item.category === category)),
    [all, category],
  )

  return { items, all }
}
