// src/components/category/filters/FilterSidebar.tsx
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import type { ApiBrand, ApiCategory, ApiSubCategory } from '../../../types/catalog'
import { AvailabilityFilter } from './AvailabilityFilter'
import { BrandFilter } from './BrandFilter'
import { CategoryFilter } from './CategoryFilter'
import { ConcernsFilter } from './ConcernsFilter'
import type { FilterState } from './filterState'
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
  subcategoriesLoading?: boolean
  brands: ApiBrand[]
  /** Mobile drawer open state (controlled from results strip). */
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
}

function FilterPanelBody({
  filters,
  onFiltersChange,
  onFiltersReset,
  categories,
  activeCategorySlug,
  subcategories,
  subcategoriesLoading,
  brands,
  headingId,
  showClose,
  onClose,
}: {
  filters: FilterState
  onFiltersChange: (patch: Partial<FilterState>) => void
  onFiltersReset: () => void
  categories: ApiCategory[]
  activeCategorySlug?: string
  subcategories: ApiSubCategory[]
  subcategoriesLoading?: boolean
  brands: ApiBrand[]
  headingId?: string
  showClose?: boolean
  onClose?: () => void
}) {
  const { t } = useTranslation()

  return (
    <>
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <h2 id={headingId} className={filterSidebarHeadingClasses}>
          {t('catalogBrowse.filters')}
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onFiltersReset}
            className={cn(filterClearAllClasses, focusRingClasses, 'min-h-11 rounded-sm px-1')}
          >
            {t('catalogBrowse.clearAll')}
          </button>
          {showClose ? (
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'inline-flex size-11 items-center justify-center rounded-full text-secondary-text',
                'hover:bg-surface-muted hover:text-primary-text',
                focusRingClasses,
              )}
              aria-label={t('catalogBrowse.closeFilters')}
            >
              <X size={18} strokeWidth={1.75} aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      <div className="filter-sidebar-groups">
        <SensitivityFilter
          selectedIds={filters.sensitivityIds}
          onChange={(sensitivityIds) => onFiltersChange({ sensitivityIds })}
        />
        <CategoryFilter categories={categories} activeSlug={activeCategorySlug} />
        <TypeOfCategoryFilter
          selectedIds={filters.typeOfCategoryIds}
          onChange={(typeOfCategoryIds) => onFiltersChange({ typeOfCategoryIds })}
          subcategories={subcategories}
          loading={subcategoriesLoading}
          categorySelected={Boolean(activeCategorySlug)}
        />
        <ConcernsFilter
          selectedIds={filters.concernIds}
          onChange={(concernIds) => onFiltersChange({ concernIds })}
        />
        <OffersFilter
          selectedIds={filters.offerIds}
          onChange={(offerIds) => onFiltersChange({ offerIds })}
        />
        <BrandFilter
          selectedIds={filters.brandIds}
          onChange={(brandIds) => onFiltersChange({ brandIds })}
          brands={brands}
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
      </div>
    </>
  )
}

export function FilterSidebar({
  className,
  filters,
  onFiltersChange,
  onFiltersReset,
  categories,
  activeCategorySlug,
  subcategories,
  subcategoriesLoading,
  brands,
  mobileOpen = false,
  onMobileOpenChange,
}: FilterSidebarProps) {
  const { t, i18n } = useTranslation()
  const titleId = useId()
  const panelRef = useRef<HTMLElement>(null)
  const isRtl = i18n.dir() === 'rtl'
  // Drawer from inline-end: right in LTR, left in RTL (task #5).
  const enterX = isRtl ? '-100%' : '100%'

  useEffect(() => {
    if (!mobileOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const frame = window.requestAnimationFrame(() => {
      panelRef.current?.focus()
    })

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onMobileOpenChange?.(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      window.cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [mobileOpen, onMobileOpenChange])

  return (
    <>
      {/* Desktop sidebar — pinned while the product grid scrolls; scrolls on its own when taller than the screen */}
      <aside
        className={cn(
          'hidden w-full shrink-0 lg:block lg:max-w-[24.25rem]',
          'lg:rounded-small lg:bg-card lg:p-medium',
          'lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto lg:overscroll-contain',
          className,
        )}
        aria-label={t('catalogBrowse.filters')}
      >
        <FilterPanelBody
          filters={filters}
          onFiltersChange={onFiltersChange}
          onFiltersReset={onFiltersReset}
          categories={categories}
          activeCategorySlug={activeCategorySlug}
          subcategories={subcategories}
          subcategoriesLoading={subcategoriesLoading}
          brands={brands}
        />
      </aside>

      {/* Mobile side drawer — Figma 413:19413 / 1446:18637 */}
      <AnimatePresence>
        {mobileOpen ? (
          <div
            className="fixed inset-0 z-[60] lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <motion.button
              type="button"
              tabIndex={-1}
              className="absolute inset-0 bg-black/50"
              aria-label={t('catalogBrowse.closeFilters')}
              onClick={() => onMobileOpenChange?.(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.aside
              ref={panelRef}
              tabIndex={-1}
              className={cn(
                'absolute inset-y-0 end-0 flex h-full w-[min(100%,24.25rem)] flex-col',
                'bg-card outline-none shadow-2xl',
              )}
              initial={{ x: enterX }}
              animate={{ x: 0 }}
              exit={{ x: enterX }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
                <FilterPanelBody
                  filters={filters}
                  onFiltersChange={onFiltersChange}
                  onFiltersReset={onFiltersReset}
                  categories={categories}
                  activeCategorySlug={activeCategorySlug}
                  subcategories={subcategories}
                  subcategoriesLoading={subcategoriesLoading}
                  brands={brands}
                  headingId={titleId}
                  showClose
                  onClose={() => onMobileOpenChange?.(false)}
                />
              </div>

              <div className="shrink-0 border-t border-border-subtle bg-card px-5 py-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onFiltersReset()
                      onMobileOpenChange?.(false)
                    }}
                    className={cn(
                      'inline-flex min-h-11 flex-1 items-center justify-center rounded-extra-small',
                      'border border-border-subtle font-display text-extra-small text-primary-text',
                      focusRingClasses,
                    )}
                  >
                    {t('catalogBrowse.clearAll')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onMobileOpenChange?.(false)}
                    className={cn(
                      'inline-flex min-h-11 flex-1 items-center justify-center rounded-extra-small',
                      'bg-button-primary font-display text-extra-small text-on-emphasis',
                      focusRingClasses,
                    )}
                  >
                    {t('catalogBrowse.applyFilters')}
                  </button>
                </div>
              </div>
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
