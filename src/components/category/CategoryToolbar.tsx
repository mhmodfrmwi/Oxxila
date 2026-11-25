// src/components/category/CategoryToolbar.tsx
import { SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import { Dropdown } from '../ui/Dropdown'
import { focusRingClasses } from '../ui/interactionStyles'
import type { SortOption } from './categoryData'

interface CategoryToolbarProps {
  categoryName: string
  productCount: number
  totalResults: number
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  /** Current page range start (1-based). */
  rangeFrom?: number
  /** Opens the mobile filter drawer. */
  onOpenFilters?: () => void
  /** Active filter count for the mobile Filters badge. */
  activeFilterCount?: number
  className?: string
}

function SortSelect({
  sort,
  onSortChange,
  className,
}: {
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  className?: string
}) {
  const { t } = useTranslation()

  const options = [
    { value: 'newest', label: t('categorySort.newest') },
    { value: 'price-asc', label: t('categorySort.priceAsc') },
    { value: 'price-desc', label: t('categorySort.priceDesc') },
    { value: 'rating', label: t('categorySort.rating') },
  ]

  return (
    <Dropdown
      className={className}
      options={options}
      value={sort}
      onChange={(next) => onSortChange(next as SortOption)}
      ariaLabel={t('categorySort.label')}
      unstyled
      triggerClassName="catalog-sort-select"
      panelMinWidth
    />
  )
}

export function CategoryToolbar({
  categoryName,
  productCount,
  totalResults,
  sort,
  onSortChange,
  rangeFrom = 1,
  onOpenFilters,
  activeFilterCount = 0,
  className,
}: CategoryToolbarProps) {
  const { t } = useTranslation()
  const rangeTo = Math.max(rangeFrom - 1 + productCount, rangeFrom)
  const displayTotal = Math.max(totalResults, productCount)
  const from = productCount === 0 ? 0 : rangeFrom
  const to = productCount === 0 ? 0 : rangeTo
  const namedQuery =
    categoryName.trim() && categoryName.trim().toLowerCase() !== 'categories'
      ? categoryName.trim()
      : ''
  const resultsLabel = namedQuery
    ? t('catalogBrowse.resultsRangeNamed', {
        from,
        to,
        total: displayTotal || 0,
        query: namedQuery,
      })
    : t('catalogBrowse.resultsRange', {
        from,
        to,
        total: displayTotal || 0,
      })

  return (
    <div className={cn('space-y-3', className)}>
      {/* Mobile strip Figma 413:19416 · desktop results line 413:16462 */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3',
          '-mx-[var(--page-gutter)] bg-card',
          'lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0',
        )}
      >
        {onOpenFilters ? (
          <button
            type="button"
            onClick={onOpenFilters}
            className={cn(
              'relative inline-flex size-11 shrink-0 items-center justify-center',
              'rounded-extra-small border border-border-subtle bg-input text-icon-primary',
              'lg:hidden',
              focusRingClasses,
            )}
            aria-label={t('catalogBrowse.openFilters')}
          >
            <SlidersHorizontal className="size-5" strokeWidth={1.75} aria-hidden />
            {activeFilterCount > 0 ? (
              <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-button-primary px-1 text-[10px] font-semibold text-on-emphasis">
                {activeFilterCount > 99 ? '99+' : activeFilterCount}
              </span>
            ) : null}
          </button>
        ) : null}

        {/* Body font (Nohemi / IBM Plex) — not display/serif */}
        <p
          className={cn(
            'min-w-0 flex-1 font-sans text-small font-medium leading-[1.4] text-secondary-text',
            'lg:text-primary-text',
          )}
        >
          {resultsLabel}
        </p>

        <SortSelect
          sort={sort}
          onSortChange={onSortChange}
          className="ms-auto hidden shrink-0 lg:block"
        />
      </div>

      <SortSelect sort={sort} onSortChange={onSortChange} className="w-full lg:hidden" />
    </div>
  )
}
