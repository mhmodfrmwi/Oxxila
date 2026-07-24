// src/components/admin/customers/CustomersStatsRow.tsx
import { useTranslation } from 'react-i18next'
import type { AdminCustomerStats } from '../../../types/adminCustomers'
import {
  formatCustomerCount,
  formatCustomerMoney,
  formatUnavailableMetric,
} from '../../../utils/adminCustomersFormat'
import { Skeleton } from '../ui/Skeleton'
import { StatCard, type StatTrendTone } from '../ui/StatCard'

interface CustomersStatsRowProps {
  stats: AdminCustomerStats | null
  loading?: boolean
}

function trendTone(trend: number | null): StatTrendTone {
  if (trend == null || trend === 0) return 'neutral'
  return trend > 0 ? 'positive' : 'negative'
}

/**
 * Contract: only Total Customers + Average LTV from GET /users/stats.
 */
export function CustomersStatsRow({
  stats,
  loading = false,
}: CustomersStatsRowProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const unavailable = formatUnavailableMetric()

  if (loading && !stats) {
    return (
      <div className="flex w-full flex-col gap-6 sm:flex-row sm:flex-wrap xl:flex-nowrap">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="admin-glass-strong flex min-h-[6.25rem] min-w-0 flex-1 flex-col gap-3 rounded-[var(--admin-radius-lg)] p-[var(--admin-card-pad-md)] sm:basis-[calc(50%-0.6rem)] xl:basis-0"
            aria-hidden
          >
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <section
      className="flex w-full flex-col gap-6 sm:flex-row sm:flex-wrap xl:flex-nowrap"
      aria-label={t('admin.customers.statsAria')}
    >
      <StatCard
        strong
        className="min-h-[6.25rem] min-w-0 flex-1 sm:basis-[calc(50%-0.6rem)] xl:basis-0"
        label={t('admin.customers.stats.totalCustomers')}
        value={
          stats
            ? formatCustomerCount(stats.totalCustomers.value, locale)
            : unavailable
        }
        trend={stats?.totalCustomers.trendLabel ?? undefined}
        trendTone={trendTone(stats?.totalCustomers.trend ?? null)}
      />
      <StatCard
        strong
        className="min-h-[6.25rem] min-w-0 flex-1 sm:basis-[calc(50%-0.6rem)] xl:basis-0"
        label={t('admin.customers.stats.averageLtv')}
        value={
          stats
            ? formatCustomerMoney(stats.averageLtv.value, locale)
            : unavailable
        }
        trend={stats?.averageLtv.trendLabel ?? undefined}
        trendTone={trendTone(stats?.averageLtv.trend ?? null)}
      />
    </section>
  )
}
