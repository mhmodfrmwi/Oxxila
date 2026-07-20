// src/components/admin/dashboard/DashboardRevenueCard.tsx
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import type { DashboardRevenueChartData, RevenueInterval } from '../../../types/adminDashboard'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Button } from '../../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'
import { RevenueBarChart } from './charts/RevenueBarChart'

interface DashboardRevenueCardProps {
  chart: DashboardRevenueChartData | null
  loading?: boolean
  error?: string | null
  interval: RevenueInterval
  onIntervalChange: (interval: RevenueInterval) => void
  onRetry?: () => void
  periodDays: number
}

export function DashboardRevenueCard({
  chart,
  loading = false,
  error = null,
  interval,
  onIntervalChange,
  onRetry,
  periodDays,
}: DashboardRevenueCardProps) {
  const { t } = useTranslation()
  const points = chart?.points ?? []

  return (
    <GlassCard
      padding="lg"
      className="flex min-h-[28rem] flex-col gap-8 rounded-[var(--admin-radius-xl)] lg:col-span-2"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="admin-section-title">
            {t('admin.dashboard.revenue.title')}
          </h2>
          <p className="text-sm text-secondary-text">
            {t('admin.dashboard.revenue.subtitle', { days: periodDays })}
          </p>
        </div>
        <div
          className="flex gap-2"
          role="group"
          aria-label={t('admin.dashboard.revenue.intervalGroup')}
        >
          {(['daily', 'weekly'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onIntervalChange(option)}
              aria-pressed={interval === option}
              className={cn(
                'rounded-[var(--admin-radius-sm)] px-4 py-2 text-xs font-semibold transition-colors',
                focusRingClasses,
                interval === option
                  ? 'border border-border-subtle bg-white/10 text-primary-text'
                  : 'bg-white/5 text-secondary-text hover:bg-white/10',
              )}
            >
              {t(`admin.dashboard.revenue.intervals.${option}`)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-[var(--admin-radius-md)]" />
      ) : error ? (
        <EmptyState
          title={t('admin.dashboard.revenue.errorTitle')}
          description={error}
          className="min-h-64"
          action={
            onRetry ? (
              <Button type="button" variant="outline" onClick={onRetry}>
                {t('admin.dashboard.retry')}
              </Button>
            ) : undefined
          }
        />
      ) : points.length === 0 ? (
        <EmptyState
          title={t('admin.dashboard.revenue.emptyTitle')}
          description={t('admin.dashboard.revenue.emptyDescription')}
          className="min-h-64"
        />
      ) : (
        <RevenueBarChart points={points} />
      )}
    </GlassCard>
  )
}
