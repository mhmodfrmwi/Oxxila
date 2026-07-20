// src/components/admin/customers/CustomersStatsRow.tsx
import { useTranslation } from 'react-i18next'
import {
  formatCustomerCount,
  formatUnavailableMetric,
} from '../../../utils/adminCustomersFormat'
import { Skeleton } from '../ui/Skeleton'
import { StatCard } from '../ui/StatCard'

interface CustomersStatsRowProps {
  totalCustomers: number | null
  loading?: boolean
}

/**
 * Figma KPI row. Only Total Customers comes from the list pagination;
 * LTV / VIP / Retention have no admin endpoint — show em dash, no fake trends.
 */
export function CustomersStatsRow({
  totalCustomers,
  loading = false,
}: CustomersStatsRowProps) {
  const { t, i18n } = useTranslation()
  const unavailable = formatUnavailableMetric()

  if (loading && totalCustomers == null) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="admin-glass flex min-h-[7.8125rem] flex-col gap-3 rounded-[var(--admin-radius-lg)] p-6"
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
      className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-[1.5rem]"
      aria-label={t('admin.customers.statsAria')}
    >
      <StatCard
        className="min-h-[7.8125rem]"
        label={t('admin.customers.stats.totalCustomers')}
        value={
          totalCustomers == null
            ? unavailable
            : formatCustomerCount(totalCustomers, i18n.language)
        }
      />
      <StatCard
        className="min-h-[7.8125rem]"
        label={t('admin.customers.stats.averageLtv')}
        value={unavailable}
      />
      <StatCard
        className="min-h-[7.8125rem]"
        label={t('admin.customers.stats.vipConcentration')}
        value={unavailable}
      />
      <StatCard
        className="min-h-[7.8125rem]"
        label={t('admin.customers.stats.retentionRate')}
        value={unavailable}
      />
    </section>
  )
}
