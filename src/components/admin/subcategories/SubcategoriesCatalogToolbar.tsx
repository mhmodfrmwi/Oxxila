// src/components/admin/subcategories/SubcategoriesCatalogToolbar.tsx
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import type { AdminCategoryRow } from '../../../types/adminCategories'
import { focusRingClasses } from '../../ui/interactionStyles'

interface SubcategoriesCatalogToolbarProps {
  keyword: string
  onKeywordChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  categories: readonly AdminCategoryRow[]
  categoriesLoading?: boolean
  disabled?: boolean
}

export function SubcategoriesCatalogToolbar({
  keyword,
  onKeywordChange,
  category,
  onCategoryChange,
  categories,
  categoriesLoading = false,
  disabled = false,
}: SubcategoriesCatalogToolbarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
      <label className="relative block w-full sm:w-[var(--admin-search-width)]">
        <span className="sr-only">{t('admin.subcategories.searchLabel')}</span>
        <Search
          size={19}
          className="pointer-events-none absolute start-5 top-1/2 -translate-y-1/2 text-secondary-text"
          aria-hidden
        />
        <input
          type="search"
          value={keyword}
          disabled={disabled}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder={t('admin.subcategories.searchPlaceholder')}
          autoComplete="off"
          className={cn(
            'admin-glass h-[43.2px] w-full rounded-2xl pe-5 ps-14 text-sm text-primary-text',
            'placeholder:text-placeholder-text',
            'disabled:cursor-not-allowed disabled:opacity-60',
            focusRingClasses,
          )}
        />
      </label>

      <label className="relative block w-full sm:w-[13rem]">
        <span className="sr-only">
          {t('admin.subcategories.filterCategoryLabel')}
        </span>
        <select
          value={category}
          disabled={disabled || categoriesLoading}
          onChange={(event) => onCategoryChange(event.target.value)}
          className={cn(
            'admin-glass h-[43.2px] w-full appearance-none rounded-2xl px-5 text-sm text-primary-text',
            'disabled:cursor-not-allowed disabled:opacity-60',
            focusRingClasses,
          )}
        >
          <option value="">
            {t('admin.subcategories.filterCategoryAll')}
          </option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
