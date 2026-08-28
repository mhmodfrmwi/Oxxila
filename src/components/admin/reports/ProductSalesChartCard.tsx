// src/components/admin/reports/ProductSalesChartCard.tsx
import { useTranslation } from 'react-i18next'
import type { ProductSalesTimeseriesPoint, ReportInterval } from '../../../types/adminReports'
import { cn } from '../../../lib/cn'
import { RevenueBarChart } from '../dashboard/charts/RevenueBarChart'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'

interface ProductSalesChartCardProps {
  points: readonly ProductSalesTimeseriesPoint[]
  interval: ReportInterval
  loading?: boolean
  onIntervalChange: (interval: ReportInterval) => void
}

export function ProductSalesChartCard({
  points,
  interval,
  loading = false,
  onIntervalChange,
}: ProductSalesChartCardProps) {
  const { t } = useTranslation()

  const chartPoints = points.map((point) => ({
    date: point.date,
    revenue: point.revenue,
    orders: point.orders,
  }))

  return (
    <GlassCard strong className="flex flex-col gap-6 rounded-[var(--admin-radius-2xl)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[14.4px] leading-7 font-bold text-white">
            {t('admin.reports.detail.chartTitle')}
          </h2>
          <p className="text-xs text-secondary-text">{t('admin.reports.detail.chartSubtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {(['daily', 'weekly'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onIntervalChange(value)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                interval === value
                  ? 'bg-accent text-white'
                  : 'border border-white/10 bg-white/5 text-secondary-text hover:bg-white/[0.07]',
              )}
            >
              {t(`admin.reports.interval.${value}`)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : chartPoints.length === 0 ? (
        <EmptyState
          title={t('admin.reports.detail.chartEmptyTitle')}
          description={t('admin.reports.detail.chartEmptyDescription')}
        />
      ) : (
        <RevenueBarChart points={chartPoints} />
      )}
    </GlassCard>
  )
}
