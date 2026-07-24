// src/components/admin/products/ProductsCatalogToolbar.tsx
import { ChevronDown, ListFilter, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ApiCategory } from '../../../types/catalog'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'

interface ProductsCatalogToolbarProps {
  keyword: string
  onKeywordChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  categories: readonly ApiCategory[]
  categoriesLoading?: boolean
  filtersOpen: boolean
  onFiltersOpenChange: (open: boolean) => void
  bulkOpen: boolean
  onBulkOpenChange: (open: boolean) => void
}

/* Figma Products: search Fill h-54 rounded-16; filter hug h-54 rounded-16 */
const glassControlClass = cn(
  'admin-glass inline-flex h-[43.2px] shrink-0 items-center gap-2 rounded-2xl px-[20px]',
  'text-sm font-medium text-primary-text',
  'transition-colors hover:bg-white/[0.08]',
  'disabled:pointer-events-none disabled:opacity-50',
  focusRingClasses,
)

export function ProductsCatalogToolbar({
  keyword,
  onKeywordChange,
  category,
  onCategoryChange,
  categories,
  categoriesLoading = false,
  filtersOpen,
  onFiltersOpenChange,
  bulkOpen,
  onBulkOpenChange,
}: ProductsCatalogToolbarProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-3">
      <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
        <label className="relative block min-w-0 flex-1">
          <span className="sr-only">{t('admin.products.searchLabel')}</span>
          <Search
            size={19}
            className="pointer-events-none absolute start-5 top-1/2 -translate-y-1/2 text-secondary-text"
            aria-hidden
          />
          <input
            type="search"
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder={t('admin.products.searchPlaceholder')}
            autoComplete="off"
            className={cn(
              'admin-glass h-[43.2px] w-full rounded-2xl pe-5 ps-14 text-sm text-primary-text',
              'placeholder:text-placeholder-text',
              focusRingClasses,
            )}
          />
        </label>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <button
            type="button"
            className={glassControlClass}
            aria-expanded={filtersOpen}
            aria-controls="admin-products-filters"
            onClick={() => onFiltersOpenChange(!filtersOpen)}
          >
            <ListFilter size={13} aria-hidden />
            {t('admin.products.filters')}
          </button>

          <div className="relative" data-admin-bulk-root>
            <button
              type="button"
              className={glassControlClass}
              aria-expanded={bulkOpen}
              aria-haspopup="menu"
              id="admin-products-bulk-trigger"
              onClick={() => onBulkOpenChange(!bulkOpen)}
            >
              {t('admin.products.bulkActions')}
              <ChevronDown size={13} aria-hidden className="opacity-70" />
            </button>

            {bulkOpen && (
              <div
                role="menu"
                aria-labelledby="admin-products-bulk-trigger"
                className={cn(
                  'admin-glass absolute end-0 z-20 mt-2 min-w-[9.6rem] rounded-xl p-1.5 shadow-lg',
                )}
              >
                <p className="px-3 py-2 text-xs text-secondary-text" role="menuitem" tabIndex={-1}>
                  {t('admin.products.bulkSoon')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div
          id="admin-products-filters"
          className="admin-glass flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-end"
        >
          <label className="flex min-w-[11.2rem] flex-1 flex-col gap-1.5">
            <span className="admin-label">{t('admin.products.filterCategory')}</span>
            <select
              value={category}
              onChange={(event) => onCategoryChange(event.target.value)}
              disabled={categoriesLoading}
              className={cn(
                'rounded-xl border border-border-subtle bg-input px-3 py-2.5 text-sm text-primary-text',
                focusRingClasses,
              )}
            >
              <option value="">{t('admin.products.filterCategoryAll')}</option>
              {categories.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          {category ? (
            <button
              type="button"
              className={cn(
                'text-sm font-medium text-accent hover:text-accent-soft',
                focusRingClasses,
                'rounded-md px-2 py-1',
              )}
              onClick={() => onCategoryChange('')}
            >
              {t('admin.products.clearFilters')}
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}
