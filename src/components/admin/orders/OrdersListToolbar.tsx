// src/components/admin/orders/OrdersListToolbar.tsx
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'

interface OrdersListToolbarProps {
  keyword: string
  dateFrom: string
  dateTo: string
  onKeywordChange: (value: string) => void
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  disabled?: boolean
}

export function OrdersListToolbar({
  keyword,
  dateFrom,
  dateTo,
  onKeywordChange,
  onDateFromChange,
  onDateToChange,
  disabled = false,
}: OrdersListToolbarProps) {
  const { t } = useTranslation()

  const fieldClass = cn(
    'rounded-full border border-white/10 bg-white/5 text-sm text-primary-text',
    'placeholder:text-white/50 shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.05)]',
    'transition-colors hover:bg-white/[0.07]',
    focusRingClasses,
    disabled && 'cursor-not-allowed opacity-60',
  )

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
      <label className="relative block w-full sm:w-64">
        <span className="sr-only">{t('admin.orders.searchLabel')}</span>
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
          placeholder={t('admin.orders.searchPlaceholder')}
          className={cn(fieldClass, 'w-full py-2.5 pe-5 ps-12')}
          autoComplete="off"
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2">
          <span className="text-[10px] font-medium tracking-[0.08em] text-white/40 uppercase">
            {t('admin.orders.dateFrom')}
          </span>
          <input
            type="date"
            value={dateFrom}
            disabled={disabled}
            onChange={(event) => onDateFromChange(event.target.value)}
            className={cn(fieldClass, 'px-3 py-2')}
            aria-label={t('admin.orders.dateFrom')}
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-[10px] font-medium tracking-[0.08em] text-white/40 uppercase">
            {t('admin.orders.dateTo')}
          </span>
          <input
            type="date"
            value={dateTo}
            disabled={disabled}
            min={dateFrom || undefined}
            onChange={(event) => onDateToChange(event.target.value)}
            className={cn(fieldClass, 'px-3 py-2')}
            aria-label={t('admin.orders.dateTo')}
          />
        </label>
      </div>
    </div>
  )
}
