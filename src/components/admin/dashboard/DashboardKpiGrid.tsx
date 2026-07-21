// src/components/admin/dashboard/DashboardKpiGrid.tsx
import { useTranslation } from 'react-i18next'
import type { DashboardKpis } from '../../../types/adminDashboard'
import {
  formatDashboardMoney,
  formatDashboardNumber,
  formatDashboardPercent,
  formatTrendLabel,
  invertedTrendTone,
  trendTone,
} from '../../../utils/adminDashboardFormat'
import { Skeleton } from '../ui/Skeleton'
import { StatCard } from '../ui/StatCard'

interface DashboardKpiGridProps {
  kpis: DashboardKpis | null
  loading?: boolean
}

export function DashboardKpiGrid({ kpis, loading = false }: DashboardKpiGridProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  if (loading || !kpis) {
    return (
      <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="admin-glass flex min-h-[9.5rem] flex-col gap-3 rounded-[var(--admin-radius-lg)] p-6"
            aria-hidden
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <section
      className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4"
      aria-label={t('admin.dashboard.kpis.ariaLabel')}
    >
      <StatCard
        label={t('admin.dashboard.kpis.totalRevenue')}
        value={formatDashboardMoney(kpis.totalRevenue.value, locale)}
        trend={formatTrendLabel(kpis.totalRevenue.trend, locale)}
        trendTone={trendTone(kpis.totalRevenue.trend)}
      />
      <StatCard
        label={t('admin.dashboard.kpis.orders')}
        value={formatDashboardNumber(kpis.orders.value, locale)}
        trend={formatTrendLabel(kpis.orders.trend, locale)}
        trendTone={trendTone(kpis.orders.trend)}
      />
      <StatCard
        label={t('admin.dashboard.kpis.conversionRate')}
        value={formatDashboardPercent(kpis.conversionRate.value, locale)}
        trend={formatTrendLabel(kpis.conversionRate.trend, locale)}
        trendTone={trendTone(kpis.conversionRate.trend)}
      />
      <StatCard
        label={t('admin.dashboard.kpis.abandonedCart')}
        value={formatDashboardPercent(kpis.abandonedCart.value, locale)}
        trend={formatTrendLabel(kpis.abandonedCart.trend, locale)}
        trendTone={invertedTrendTone(kpis.abandonedCart.trend)}
      />
    </section>
  )
}
