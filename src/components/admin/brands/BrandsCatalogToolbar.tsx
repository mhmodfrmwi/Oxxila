// src/components/admin/brands/BrandsCatalogToolbar.tsx
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'

interface BrandsCatalogToolbarProps {
  keyword: string
  onKeywordChange: (value: string) => void
  disabled?: boolean
}

export function BrandsCatalogToolbar({
  keyword,
  onKeywordChange,
  disabled = false,
}: BrandsCatalogToolbarProps) {
  const { t } = useTranslation()

  return (
    <label className="relative block w-full sm:w-[var(--admin-search-width)]">
      <span className="sr-only">{t('admin.brands.searchLabel')}</span>
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
        placeholder={t('admin.brands.searchPlaceholder')}
        autoComplete="off"
        className={cn(
          'admin-glass h-[43.2px] w-full rounded-2xl pe-5 ps-14 text-sm text-primary-text',
          'placeholder:text-placeholder-text',
          'disabled:cursor-not-allowed disabled:opacity-60',
          focusRingClasses,
        )}
      />
    </label>
  )
}
