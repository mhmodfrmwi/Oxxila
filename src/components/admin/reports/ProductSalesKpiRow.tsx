// src/components/admin/reports/ProductSalesKpiRow.tsx
import { useTranslation } from 'react-i18next'
import type { ProductSalesSummary } from '../../../types/adminReports'
import {
  formatDashboardMoney,
  formatDashboardNumber,
} from '../../../utils/adminDashboardFormat'
import { cn } from '../../../lib/cn'
import { GlassCard } from '../ui/GlassCard'
import { StatCard } from '../ui/StatCard'
import { Skeleton } from '../ui/Skeleton'

interface ProductSalesKpiRowProps {
  summary: ProductSalesSummary | null
  loading?: boolean
  variant?: 'list' | 'detail'
}

export function ProductSalesKpiRow({
  summary,
  loading = false,
  variant = 'list',
}: ProductSalesKpiRowProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  if (loading && !summary) {
    return (
      <div
        className={cn(
          'grid gap-4',
          variant === 'list'
            ? 'grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))]'
            : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
        )}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            className={cn(
              'rounded-[var(--admin-radius-2xl)]',
              index === 0 && variant === 'list'
                ? 'min-h-[var(--admin-kpi-min-height)] lg:row-span-1'
                : 'h-[var(--admin-kpi-min-height)]',
            )}
          />
        ))}
      </div>
    )
  }

  const secondaryCards =
    variant === 'list'
      ? [
          {
            label: t('admin.reports.kpi.totalUnits'),
            value: formatDashboardNumber(summary?.totalUnits ?? 0, locale),
          },
          {
            label: t('admin.reports.kpi.orderCount'),
            value: formatDashboardNumber(summary?.orderCount ?? 0, locale),
          },
          {
            label: t('admin.reports.kpi.productCount'),
            value: formatDashboardNumber(summary?.productCount ?? 0, locale),
          },
        ]
      : [
          {
            label: t('admin.reports.kpi.totalUnits'),
            value: formatDashboardNumber(summary?.totalUnits ?? 0, locale),
          },
          {
            label: t('admin.reports.kpi.orderCount'),
            value: formatDashboardNumber(summary?.orderCount ?? 0, locale),
          },
          {
            label: t('admin.reports.kpi.avgUnitPrice'),
            value: formatDashboardMoney(summary?.avgUnitPrice ?? 0, locale),
          },
        ]

  if (variant === 'detail') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('admin.reports.kpi.totalRevenue')}
          value={formatDashboardMoney(summary?.totalRevenue ?? 0, locale)}
          strong
        />
        {secondaryCards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} strong />
        ))}
      </div>
    )
  }

  return (
    <section
      className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))]"
      aria-label={t('admin.reports.kpi.ariaLabel')}
    >
      <GlassCard
        strong
        className="relative overflow-hidden rounded-[var(--admin-radius-2xl)] border border-accent/20 bg-gradient-to-br from-accent/15 via-white/[0.04] to-transparent p-[var(--admin-card-pad-md)]"
      >
        <p className="admin-label text-accent/80">{t('admin.reports.kpi.totalRevenue')}</p>
        <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-primary-text">
          {formatDashboardMoney(summary?.totalRevenue ?? 0, locale)}
        </p>
        <p className="mt-2 text-xs text-secondary-text">{t('admin.reports.kpi.revenueHint')}</p>
      </GlassCard>

      {secondaryCards.map((card) => (
        <StatCard key={card.label} label={card.label} value={card.value} strong />
      ))}
    </section>
  )
}
