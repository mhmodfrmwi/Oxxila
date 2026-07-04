import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import type { ApiBrand, ApiCategory, ApiSubCategory } from '../../../types/catalog'
import { AvailabilityFilter } from './AvailabilityFilter'
import { BrandFilter } from './BrandFilter'
import { CategoryFilter } from './CategoryFilter'
import { ConcernsFilter } from './ConcernsFilter'
import { countActiveFilters, type FilterState } from './filterState'
import { filterClearAllClasses, filterSidebarHeadingClasses } from './filterStyles'
import { OffersFilter } from './OffersFilter'
import { PriceFilter } from './PriceFilter'
import { RatingFilter } from './RatingFilter'
import { SensitivityFilter } from './SensitivityFilter'
import { TypeOfCategoryFilter } from './TypeOfCategoryFilter'

interface FilterSidebarProps {
  className?: string
  filters: FilterState
  onFiltersChange: (patch: Partial<FilterState>) => void
  onFiltersReset: () => void
  categories: ApiCategory[]
  activeCategorySlug?: string
  subcategories: ApiSubCategory[]
  brands: ApiBrand[]
}

export function FilterSidebar({
  className,
  filters,
  onFiltersChange,
  onFiltersReset,
  categories,
  activeCategorySlug,
  subcategories,
  brands,
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const activeCount = countActiveFilters(filters)

  function clearAll() {
    onFiltersReset()
  }

  const filterGroups = (
    <>
      <CategoryFilter categories={categories} activeSlug={activeCategorySlug} />
      <BrandFilter
        selectedIds={filters.brandIds}
        onChange={(brandIds) => onFiltersChange({ brandIds })}
        brands={brands}
      />
      <SensitivityFilter
        selectedIds={filters.sensitivityIds}
        onChange={(sensitivityIds) => onFiltersChange({ sensitivityIds })}
      />
      <TypeOfCategoryFilter
        selectedIds={filters.typeOfCategoryIds}
        onChange={(typeOfCategoryIds) => onFiltersChange({ typeOfCategoryIds })}
        subcategories={subcategories}
      />
      <ConcernsFilter
        selectedIds={filters.concernIds}
        onChange={(concernIds) => onFiltersChange({ concernIds })}
      />
      <OffersFilter
        selectedIds={filters.offerIds}
        onChange={(offerIds) => onFiltersChange({ offerIds })}
      />
      <PriceFilter
        value={filters.priceSort}
        onChange={(priceSort) => onFiltersChange({ priceSort })}
      />
      <RatingFilter
        selectedRating={filters.rating}
        onChange={(rating) => onFiltersChange({ rating })}
      />
      <AvailabilityFilter
        inStockOnly={filters.inStockOnly}
        onChange={(inStockOnly) => onFiltersChange({ inStockOnly })}
      />
    </>
  )

  return (
    <aside
      className={cn(
        'w-full lg:max-w-[17.5rem] shrink-0',
        'lg:sticky lg:top-6 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto',
        className,
      )}
      aria-label="Product filters"
    >
      <button
        type="button"
        className={cn(
          'mb-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-card px-4 py-3.5',
          'text-sm font-medium text-primary-text shadow-sm shadow-black/[0.04]',
          'dark:shadow-none',
          'transition-colors hover:border-accent-muted/50',
          focusRingClasses,
          'lg:hidden',
        )}
        aria-expanded={isOpen}
        aria-controls="filter-sidebar-panel"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <SlidersHorizontal size={18} className="shrink-0 text-secondary-text" aria-hidden />
          <span>Filters</span>
          {activeCount > 0 && (
            <span
              className={cn(
                'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5',
                'bg-button-primary text-[10px] font-semibold text-on-emphasis',
              )}
            >
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown
          size={18}
          strokeWidth={1.75}
          className={cn(
            'shrink-0 text-secondary-text transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      <div
        id="filter-sidebar-panel"
        className={cn(!isOpen && 'hidden', 'lg:block')}
      >
        <div className="mb-5 flex items-center justify-between gap-3 lg:mb-6">
          <h2 className={filterSidebarHeadingClasses}>Filters</h2>
          <button
            type="button"
            onClick={clearAll}
            className={cn(filterClearAllClasses, focusRingClasses, 'rounded-sm')}
          >
            clear all
          </button>
        </div>

        <div className="space-y-5">{filterGroups}</div>
      </div>
    </aside>
  )
}
