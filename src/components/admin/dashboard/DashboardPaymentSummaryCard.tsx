// src/components/admin/dashboard/DashboardPaymentSummaryCard.tsx
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { DashboardPaymentSummary } from '../../../types/adminDashboard'
import {
  formatDashboardMoney,
  formatDashboardNumber,
  formatDashboardPercent,
} from '../../../utils/adminDashboardFormat'
import { Button } from '../../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'
import { StatCard } from '../ui/StatCard'

interface DashboardPaymentSummaryCardProps {
  summary: DashboardPaymentSummary | null
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  periodDays: number
}

type MetricKind = 'money' | 'percent' | 'count'

interface MetricDef {
  key: keyof DashboardPaymentSummary
  labelKey: string
  kind: MetricKind
}

/** Only keys the backend actually returns as display metrics. */
const METRIC_DEFS: readonly MetricDef[] = [
  { key: 'collected', labelKey: 'collected', kind: 'money' },
  { key: 'refunded', labelKey: 'refunded', kind: 'money' },
  { key: 'net', labelKey: 'net', kind: 'money' },
  { key: 'collectionRate', labelKey: 'collectionRate', kind: 'percent' },
  { key: 'orderCount', labelKey: 'orderCount', kind: 'count' },
  { key: 'refundCount', labelKey: 'refundCount', kind: 'count' },
]

function formatMetric(
  value: number,
  kind: MetricKind,
  locale: string,
): string {
  if (kind === 'money') return formatDashboardMoney(value, locale)
  if (kind === 'percent') return formatDashboardPercent(value, locale)
  return formatDashboardNumber(value, locale)
}

function isEmptySummary(summary: DashboardPaymentSummary): boolean {
  return (
    summary.collected === 0 &&
    summary.refunded === 0 &&
    summary.orderCount === 0 &&
    summary.refundCount === 0
  )
}

export function DashboardPaymentSummaryCard({
  summary,
  loading = false,
  error = null,
  onRetry,
  periodDays,
}: DashboardPaymentSummaryCardProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  const metrics = useMemo(() => {
    if (!summary) return []
    return METRIC_DEFS.filter((def) => {
      const value = summary[def.key]
      return typeof value === 'number' && Number.isFinite(value)
    }).map((def) => ({
      ...def,
      value: summary[def.key] as number,
    }))
  }, [summary])

  const empty = !loading && !error && summary != null && isEmptySummary(summary)

  return (
    <GlassCard
      padding="lg"
      strong
      className="flex w-full min-w-0 flex-col gap-6 rounded-[var(--admin-radius-xl)]"
    >
      <div className="space-y-1">
        <h2 className="admin-section-title">
          {t('admin.dashboard.paymentSummary.title')}
        </h2>
        <p className="text-sm text-secondary-text">
          {t('admin.dashboard.paymentSummary.subtitle', {
            days: summary?.periodDays ?? periodDays,
          })}
        </p>
      </div>

      {loading ? (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          aria-hidden
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="admin-glass flex min-h-[var(--admin-kpi-min-height)] flex-col gap-3 rounded-[var(--admin-radius-lg)] p-[var(--admin-card-pad-md)]"
            >
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-28" />
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title={t('admin.dashboard.paymentSummary.errorTitle')}
          description={error}
          action={
            onRetry ? (
              <Button type="button" variant="outline" onClick={onRetry}>
                {t('admin.dashboard.retry')}
              </Button>
            ) : undefined
          }
        />
      ) : empty || metrics.length === 0 ? (
        <EmptyState
          title={t('admin.dashboard.paymentSummary.emptyTitle')}
          description={t('admin.dashboard.paymentSummary.emptyDescription')}
        />
      ) : (
        <section
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          aria-label={t('admin.dashboard.paymentSummary.ariaLabel')}
        >
          {metrics.map((metric) => (
            <StatCard
              key={metric.key}
              className="min-w-0"
              label={t(`admin.dashboard.paymentSummary.metrics.${metric.labelKey}`)}
              value={formatMetric(metric.value, metric.kind, locale)}
            />
          ))}
        </section>
      )}
    </GlassCard>
  )
}
