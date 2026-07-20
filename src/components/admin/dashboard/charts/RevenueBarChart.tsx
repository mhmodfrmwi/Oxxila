// src/components/admin/dashboard/charts/RevenueBarChart.tsx
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../../lib/cn'
import type { DashboardRevenuePoint } from '../../../../types/adminDashboard'
import {
  formatDashboardMoney,
  sampleRevenuePoints,
} from '../../../../utils/adminDashboardFormat'

interface RevenueBarChartProps {
  points: readonly DashboardRevenuePoint[]
  className?: string
  maxBars?: number
}

export function RevenueBarChart({
  points,
  className,
  maxBars = 16,
}: RevenueBarChartProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  const displayPoints = useMemo(
    () => sampleRevenuePoints(points, maxBars),
    [points, maxBars],
  )

  const maxRevenue = Math.max(...displayPoints.map((point) => point.revenue), 1)
  const peakIndex = displayPoints.reduce(
    (best, point, index) =>
      point.revenue > (displayPoints[best]?.revenue ?? -1) ? index : best,
    0,
  )

  if (displayPoints.length === 0) {
    return (
      <div
        className={cn('flex h-64 items-center justify-center text-sm text-secondary-text', className)}
        role="img"
        aria-label={t('admin.dashboard.revenue.chartEmptyAria')}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex h-64 items-end justify-between gap-1 overflow-x-auto px-1 sm:gap-1.5',
        className,
      )}
      role="img"
      aria-label={t('admin.dashboard.revenue.chartAria')}
    >
      {displayPoints.map((point, index) => {
        const heightPercent = Math.max((point.revenue / maxRevenue) * 100, point.revenue > 0 ? 6 : 3)
        const isPeak = index === peakIndex && point.revenue > 0
        const label = `${point.date}: ${formatDashboardMoney(point.revenue, locale)}`

        return (
          <div
            key={`${point.date}-${index}`}
            className="group relative flex h-full min-w-[0.5rem] flex-1 flex-col items-center justify-end"
          >
            <button
              type="button"
              tabIndex={0}
              title={label}
              aria-label={label}
              className="flex h-full w-full max-w-4 flex-col items-center justify-end rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              <span
                className={cn(
                  'w-full rounded-t-full transition-colors',
                  isPeak
                    ? 'bg-accent/45 shadow-[0_0_20px_0_var(--admin-glow)] ring-1 ring-accent/50'
                    : 'bg-white/10 group-hover:bg-accent/30 group-focus-visible:bg-accent/30',
                )}
                style={{ height: `${heightPercent}%` }}
              />
            </button>
          </div>
        )
      })}
    </div>
  )
}
