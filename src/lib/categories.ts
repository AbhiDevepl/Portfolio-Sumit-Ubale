/**
 * Curated filter-chip sets.
 *
 * Every slug here must be a key in `portfolio.images` in
 * public/data/portfolio.json (plus the `all` pseudo-category) — a chip whose
 * slug has no matching key renders an empty grid with no error.
 * `tests/check-portfolio-data.mjs` enforces that; run it after editing.
 *
 * The lists are curated, not derived: the home page and the portfolio page
 * deliberately show different subsets, exactly as the static site did.
 */

export const ALL_CATEGORY = 'all'

/** Home page portfolio section. */
export const HOME_CATEGORIES = [
  'all',
  'weddings',
  'engagement',
  'haldi',
  'maternity',
  'cinematics',
  'pre-wedding-photos-and-videos',
  'portraits',
  'kids',
] as const

/** /portfolio filter chips. */
export const PORTFOLIO_CATEGORIES = [
  'all',
  'weddings',
  'pre-wedding-photos-and-videos',
  'engagement',
  'haldi',
  'maternity',
  'portraits',
  'cinematics',
] as const

/** Display labels, matching the static markup. */
export const CATEGORY_LABELS: Record<string, string> = {
  'all': 'All',
  'weddings': 'Weddings',
  'engagement': 'Engagement',
  'haldi': 'Haldi',
  'maternity': 'Maternity',
  'cinematics': 'Cinematics',
  'pre-wedding-photos-and-videos': 'Pre-Wedding',
  'portraits': 'Portraits',
  'kids': 'Kids',
  'events': 'Events',
}

/** The /portfolio chips label the first one "All Work". */
export const PORTFOLIO_CATEGORY_LABELS: Record<string, string> = {
  ...CATEGORY_LABELS,
  all: 'All Work',
}
