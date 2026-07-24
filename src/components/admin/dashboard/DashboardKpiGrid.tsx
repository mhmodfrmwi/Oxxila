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
      <div className="flex w-full flex-col gap-6 sm:flex-row sm:flex-wrap xl:flex-nowrap">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="admin-glass flex min-h-[var(--admin-kpi-min-height)] min-w-0 flex-1 flex-col gap-3 rounded-[var(--admin-radius-lg)] p-[var(--admin-card-pad-md)] sm:basis-[calc(50%-0.6rem)] xl:basis-0"
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
      className="flex w-full flex-col gap-6 sm:flex-row sm:flex-wrap xl:flex-nowrap"
      aria-label={t('admin.dashboard.kpis.ariaLabel')}
    >
      <StatCard
        className="min-w-0 flex-1 sm:basis-[calc(50%-0.6rem)] xl:basis-0"
        label={t('admin.dashboard.kpis.totalRevenue')}
        value={formatDashboardMoney(kpis.totalRevenue.value, locale)}
        trend={formatTrendLabel(kpis.totalRevenue.trend, locale)}
        trendTone={trendTone(kpis.totalRevenue.trend)}
      />
      <StatCard
        className="min-w-0 flex-1 sm:basis-[calc(50%-0.6rem)] xl:basis-0"
        label={t('admin.dashboard.kpis.orders')}
        value={formatDashboardNumber(kpis.orders.value, locale)}
        trend={formatTrendLabel(kpis.orders.trend, locale)}
        trendTone={trendTone(kpis.orders.trend)}
      />
      <StatCard
        className="min-w-0 flex-1 sm:basis-[calc(50%-0.6rem)] xl:basis-0"
        label={t('admin.dashboard.kpis.conversionRate')}
        value={formatDashboardPercent(kpis.conversionRate.value, locale)}
        trend={formatTrendLabel(kpis.conversionRate.trend, locale)}
        trendTone={trendTone(kpis.conversionRate.trend)}
      />
      <StatCard
        className="min-w-0 flex-1 sm:basis-[calc(50%-0.6rem)] xl:basis-0"
        label={t('admin.dashboard.kpis.abandonedCart')}
        value={formatDashboardPercent(kpis.abandonedCart.value, locale)}
        trend={formatTrendLabel(kpis.abandonedCart.trend, locale)}
        trendTone={invertedTrendTone(kpis.abandonedCart.trend)}
      />
    </section>
  )
}
