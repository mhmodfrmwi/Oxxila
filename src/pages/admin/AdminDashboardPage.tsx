// src/pages/admin/AdminDashboardPage.tsx
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { DashboardKpiGrid } from '../../components/admin/dashboard/DashboardKpiGrid'
import { DashboardLowStockCard } from '../../components/admin/dashboard/DashboardLowStockCard'
import { DashboardRecentOrdersCard } from '../../components/admin/dashboard/DashboardRecentOrdersCard'
import { DashboardRevenueCard } from '../../components/admin/dashboard/DashboardRevenueCard'
import { DashboardSegmentCard } from '../../components/admin/dashboard/DashboardSegmentCard'
import { DashboardTopProductsCard } from '../../components/admin/dashboard/DashboardTopProductsCard'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { focusRingClasses } from '../../components/ui/interactionStyles'
import {
  useAdminDashboardOverview,
  useAdminDashboardRevenue,
} from '../../hooks/useAdminDashboard'
import { cn } from '../../lib/cn'
import type { RevenueInterval } from '../../types/adminDashboard'

const PERIOD_DAYS = 30

/**
 * Executive Overview — Phase 1 dashboard.
 * Data access lives in hooks/API modules; this page only composes UI.
 */
export function AdminDashboardPage() {
  const { t } = useTranslation()
  const [interval, setInterval] = useState<RevenueInterval>('daily')
  const [searchQuery, setSearchQuery] = useState('')

  const overview = useAdminDashboardOverview({ periodDays: PERIOD_DAYS })
  const revenue = useAdminDashboardRevenue({ periodDays: PERIOD_DAYS, interval })

  const firstName = overview.data?.greeting.firstName
  const title = t('admin.dashboard.title')
  const subtitle = t('admin.dashboard.subtitle', {
    name: firstName || t('admin.dashboard.fallbackName'),
  })

  const query = searchQuery.trim().toLowerCase()

  const filteredTopProducts = useMemo(() => {
    const products = overview.data?.topProducts ?? []
    if (!query) return products
    return products.filter((product) => product.name.toLowerCase().includes(query))
  }, [overview.data?.topProducts, query])

  const filteredLowStock = useMemo(() => {
    const items = overview.data?.lowStock ?? []
    if (!query) return items
    return items.filter((item) => item.name.toLowerCase().includes(query))
  }, [overview.data?.lowStock, query])

  const filteredRecentOrders = useMemo(() => {
    const orders = overview.data?.recentOrders ?? []
    if (!query) return orders
    return orders.filter(
      (order) =>
        order.customerName.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query),
    )
  }, [overview.data?.recentOrders, query])

  const overviewFailed = Boolean(overview.error) && !overview.loading && !overview.data

  return (
    <>
      <AdminPageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <label className="relative block w-full sm:w-[var(--admin-search-width)]">
            <span className="sr-only">{t('admin.dashboard.searchLabel')}</span>
            <Search
              size={18}
              className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-secondary-text"
              aria-hidden
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('admin.dashboard.searchPlaceholder')}
              autoComplete="off"
              className={cn(
                'admin-glass h-[var(--admin-search-height)] w-full rounded-full pe-4 ps-11 text-sm text-primary-text',
                'placeholder:text-placeholder-text',
                focusRingClasses,
              )}
            />
          </label>
        }
      />

      {overviewFailed ? (
        <EmptyState
          title={t('admin.dashboard.loadErrorTitle')}
          description={overview.error ?? t('admin.dashboard.loadErrorDescription')}
          action={
            <Button type="button" variant="outline" onClick={() => void overview.reload()}>
              {t('admin.dashboard.retry')}
            </Button>
          }
        />
      ) : (
        <>
          <DashboardKpiGrid kpis={overview.data?.kpis ?? null} loading={overview.loading} />

          <div className="grid gap-8 lg:grid-cols-3">
            <DashboardRevenueCard
              chart={revenue.data}
              loading={revenue.loading}
              error={revenue.error}
              interval={interval}
              onIntervalChange={setInterval}
              onRetry={() => void revenue.reload()}
              periodDays={PERIOD_DAYS}
            />
            <DashboardSegmentCard
              segments={overview.data?.customerSegments ?? null}
              loading={overview.loading}
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <DashboardTopProductsCard
              products={filteredTopProducts}
              loading={overview.loading}
            />
            <DashboardLowStockCard
              items={filteredLowStock}
              loading={overview.loading}
            />
            <DashboardRecentOrdersCard
              orders={filteredRecentOrders}
              loading={overview.loading}
            />
          </div>
        </>
      )}
    </>
  )
}
