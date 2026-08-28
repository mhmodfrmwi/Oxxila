// src/components/admin/reports/ReportsFilterCard.tsx
import { CalendarRange } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ReportPeriod } from '../../../types/adminReports'
import { GlassCard } from '../ui/GlassCard'
import { ReportsToolbar } from './ReportsToolbar'
import type { ComponentProps } from 'react'

interface ReportsFilterCardProps extends ComponentProps<typeof ReportsToolbar> {
  reportPeriod?: ReportPeriod | null
}

function formatPeriodLabel(period: ReportPeriod, locale: string): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const start = formatter.format(new Date(`${period.start}T00:00:00`))
  const end = formatter.format(new Date(`${period.end}T00:00:00`))
  return `${start} – ${end}`
}

export function ReportsFilterCard({ reportPeriod, ...toolbarProps }: ReportsFilterCardProps) {
  const { t, i18n } = useTranslation()

  return (
    <GlassCard strong className="rounded-[var(--admin-radius-2xl)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-primary-text">
            {t('admin.reports.filtersTitle')}
          </h2>
          <p className="mt-0.5 text-xs text-secondary-text">
            {t('admin.reports.filtersSubtitle')}
          </p>
        </div>
        {reportPeriod ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
            <CalendarRange size={14} aria-hidden />
            <span>{formatPeriodLabel(reportPeriod, i18n.language)}</span>
          </div>
        ) : null}
      </div>

      <ReportsToolbar {...toolbarProps} />
    </GlassCard>
  )
}
