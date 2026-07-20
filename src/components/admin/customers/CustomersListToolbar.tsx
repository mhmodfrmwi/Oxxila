// src/components/admin/customers/CustomersListToolbar.tsx
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'

interface CustomersListToolbarProps {
  keyword: string
  onKeywordChange: (value: string) => void
  disabled?: boolean
}

export function CustomersListToolbar({
  keyword,
  onKeywordChange,
  disabled = false,
}: CustomersListToolbarProps) {
  const { t } = useTranslation()

  return (
    <label className="relative block w-full sm:w-64">
      <span className="sr-only">{t('admin.customers.searchLabel')}</span>
      <Search
        size={18}
        className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-white/45"
        aria-hidden
      />
      <input
        type="search"
        value={keyword}
        disabled={disabled}
        onChange={(event) => onKeywordChange(event.target.value)}
        placeholder={t('admin.customers.searchPlaceholder')}
        className={cn(
          'w-full rounded-full border border-white/10 bg-white/5 py-2.5 pe-5 ps-12',
          'text-sm text-primary-text placeholder:text-white/50',
          'shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.05)]',
          'transition-colors hover:bg-white/[0.07]',
          focusRingClasses,
          disabled && 'cursor-not-allowed opacity-60',
        )}
        autoComplete="off"
      />
    </label>
  )
}
