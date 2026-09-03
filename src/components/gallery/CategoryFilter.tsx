import { CATEGORY_LABELS } from '../../lib/categories'
import { formatCategoryName } from '../../lib/site'

export type FilterVariant = 'chips' | 'buttons'

/**
 * The one filter control. `chips` is the scrollable rail on /portfolio
 * (.filter-chip), `buttons` the pill row used on the home page and /gallery
 * (.category-btn) — both class vocabularies already exist in the stylesheets.
 */
export function CategoryFilter({
  categories,
  active,
  onSelect,
  variant = 'buttons',
  labels = CATEGORY_LABELS,
  className = '',
}: {
  categories: readonly string[]
  active: string
  onSelect: (category: string) => void
  variant?: FilterVariant
  labels?: Record<string, string>
  className?: string
}) {
  const isChips = variant === 'chips'
  const containerClass = isChips ? 'filter-chips-container' : 'portfolio-categories'
  const itemClass = isChips ? 'filter-chip' : 'category-btn'

  return (
    <div
      className={`${containerClass}${className ? ` ${className}` : ''}`}
      role="tablist"
      aria-label="Portfolio categories"
    >
      {categories.map((slug) => {
        const selected = slug === active
        const label = labels[slug] ?? formatCategoryName(slug)
        return (
          <button
            key={slug}
            type="button"
            className={`${itemClass}${selected ? ' active' : ''}`}
            data-category={slug}
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(slug)}
          >
            {isChips ? <span>{label}</span> : label}
          </button>
        )
      })}
    </div>
  )
}
