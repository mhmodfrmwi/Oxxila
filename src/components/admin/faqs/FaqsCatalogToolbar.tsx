// src/components/admin/faqs/FaqsCatalogToolbar.tsx
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import type { AdminFaqProductOption } from '../../../types/adminFaqs'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Select } from '../ui/Select'

interface FaqsCatalogToolbarProps {
  keyword: string
  onKeywordChange: (value: string) => void
  product: string
  onProductChange: (value: string) => void
  products: readonly AdminFaqProductOption[]
  productsLoading?: boolean
  disabled?: boolean
}

export function FaqsCatalogToolbar({
  keyword,
  onKeywordChange,
  product,
  onProductChange,
  products,
  productsLoading = false,
  disabled = false,
}: FaqsCatalogToolbarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
      <label className="relative block w-full sm:w-[var(--admin-search-width)]">
        <span className="sr-only">{t('admin.faqs.searchLabel')}</span>
        <Search
          size={19}
          className="pointer-events-none absolute start-5 top-1/2 -translate-y-1/2 text-secondary-text"
          aria-hidden
        />
        <input
          type="search"
          value={keyword}
          disabled={disabled || !product}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder={t('admin.faqs.searchPlaceholder')}
          autoComplete="off"
          className={cn(
            'admin-glass h-[43.2px] w-full rounded-2xl pe-5 ps-14 text-sm text-primary-text',
            'placeholder:text-placeholder-text',
            'disabled:cursor-not-allowed disabled:opacity-60',
            focusRingClasses,
          )}
        />
      </label>

      <div className="relative block w-full sm:w-[15rem]">
        <Select
          size="toolbar"
          value={product}
          onValueChange={onProductChange}
          disabled={disabled || productsLoading}
          aria-label={t('admin.faqs.filterProductLabel')}
          options={[
            { value: '', label: t('admin.faqs.filterProductAll') },
            ...products.map((item) => ({
              value: item.id,
              label: item.name,
            })),
          ]}
        />
      </div>
    </div>
  )
}
