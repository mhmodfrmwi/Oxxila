// src/components/admin/reports/ReportsToolbar.tsx
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import type { ReportPeriodPreset } from '../../../types/adminReports'
import { focusRingClasses } from '../../ui/interactionStyles'

const PERIOD_PRESETS: readonly ReportPeriodPreset[] = [7, 30, 90]

interface ReportsToolbarProps {
  keyword?: string
  period: ReportPeriodPreset | null
  dateFrom: string
  dateTo: string
  onKeywordChange?: (value: string) => void
  onPeriodChange: (value: ReportPeriodPreset) => void
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  disabled?: boolean
  showSearch?: boolean
}

export function ReportsToolbar({
  keyword = '',
  period,
  dateFrom,
  dateTo,
  onKeywordChange,
  onPeriodChange,
  onDateFromChange,
  onDateToChange,
  disabled = false,
  showSearch = true,
}: ReportsToolbarProps) {
  const { t } = useTranslation()

  const fieldClass = cn(
    'rounded-xl border border-white/10 bg-white/5 text-sm text-primary-text',
    'placeholder:text-white/50',
    'transition-colors hover:bg-white/[0.07]',
    focusRingClasses,
    disabled && 'cursor-not-allowed opacity-60',
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {PERIOD_PRESETS.map((preset) => {
          const active = period === preset && !dateFrom && !dateTo
          return (
            <button
              key={preset}
              type="button"
              disabled={disabled}
              onClick={() => onPeriodChange(preset)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
                focusRingClasses,
                active
                  ? 'bg-accent text-white shadow-[0_0_0_1px_rgb(163_148_255_/_0.35)]'
                  : 'border border-white/10 bg-white/5 text-secondary-text hover:bg-white/[0.07] hover:text-primary-text',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              {t(`admin.reports.periodDays`, { count: preset })}
            </button>
          )
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
        {showSearch ? (
          <label className="relative block min-w-0">
            <span className="sr-only">{t('admin.reports.searchLabel')}</span>
            <Search
              size={18}
              className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-white/45"
              aria-hidden
            />
            <input
              type="search"
              value={keyword}
              disabled={disabled}
              onChange={(event) => onKeywordChange?.(event.target.value)}
              placeholder={t('admin.reports.searchPlaceholder')}
              className={cn(
                fieldClass,
                'h-10 w-full pe-4 ps-10',
              )}
              autoComplete="off"
            />
          </label>
        ) : (
          <div className="hidden lg:block" />
        )}

        <label className="flex min-w-[9.5rem] flex-col gap-1.5">
          <span className="admin-label">{t('admin.reports.dateFrom')}</span>
          <input
            type="date"
            value={dateFrom}
            disabled={disabled}
            onChange={(event) => onDateFromChange(event.target.value)}
            className={cn(fieldClass, 'h-10 px-3')}
            aria-label={t('admin.reports.dateFrom')}
          />
        </label>

        <label className="flex min-w-[9.5rem] flex-col gap-1.5">
          <span className="admin-label">{t('admin.reports.dateTo')}</span>
          <input
            type="date"
            value={dateTo}
            disabled={disabled}
            onChange={(event) => onDateToChange(event.target.value)}
            className={cn(fieldClass, 'h-10 px-3')}
            aria-label={t('admin.reports.dateTo')}
          />
        </label>
      </div>
    </div>
  )
}
