// src/components/admin/dashboard/DashboardRecentOrdersCard.tsx
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ADMIN_ORDERS_PATH } from '../../../config/routes'
import type { DashboardRecentOrder } from '../../../types/adminDashboard'
import {
  formatDashboardMoney,
  formatOrderId,
  formatRelativeTime,
  orderStatusTone,
} from '../../../utils/adminDashboardFormat'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'
import { StatusBadge } from '../ui/StatusBadge'

interface DashboardRecentOrdersCardProps {
  orders: readonly DashboardRecentOrder[]
  loading?: boolean
}

export function DashboardRecentOrdersCard({
  orders,
  loading = false,
}: DashboardRecentOrdersCardProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  return (
    <GlassCard className="flex flex-col gap-6 rounded-[var(--admin-radius-lg)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-primary-text">
          {t('admin.dashboard.recentOrders.title')}
        </h2>
        <Link
          to={ADMIN_ORDERS_PATH}
          className="text-xs text-accent hover:text-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          {t('admin.dashboard.viewAll')}
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4" aria-hidden>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title={t('admin.dashboard.recentOrders.emptyTitle')}
          description={t('admin.dashboard.recentOrders.emptyDescription')}
        />
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle/50 pb-4 last:border-b-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="font-semibold text-primary-text">
                  {formatOrderId(order.id)}
                </p>
                <p className="truncate text-xs text-secondary-text">
                  <span className="text-primary-text/80">{order.customerName}</span>
                  <span aria-hidden> · </span>
                  <time dateTime={order.createdAt}>
                    {formatRelativeTime(order.createdAt, locale)}
                  </time>
                </p>
              </div>
              <StatusBadge tone={orderStatusTone(order.status)}>
                {order.status}
              </StatusBadge>
              <p className="min-w-[4.5rem] text-end text-sm font-semibold tabular-nums text-accent">
                {formatDashboardMoney(order.totalAmount, locale)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  )
}
