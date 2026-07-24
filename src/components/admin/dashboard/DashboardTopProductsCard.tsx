// src/components/admin/dashboard/DashboardTopProductsCard.tsx
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ADMIN_PRODUCTS_PATH } from '../../../config/routes'
import type { DashboardTopProduct } from '../../../types/adminDashboard'
import {
  formatDashboardMoney,
  formatDashboardNumber,
} from '../../../utils/adminDashboardFormat'
import { resolveProductImageUrl } from '../../../utils/productImage'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'

interface DashboardTopProductsCardProps {
  products: readonly DashboardTopProduct[]
  loading?: boolean
}

export function DashboardTopProductsCard({
  products,
  loading = false,
}: DashboardTopProductsCardProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  return (
    <GlassCard
      strong
      className="flex min-w-0 flex-1 flex-col gap-6 rounded-[var(--admin-radius-2xl)]"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[14.4px] leading-7 font-bold text-white">
          {t('admin.dashboard.topProducts.title')}
        </h2>
        <Link
          to={ADMIN_PRODUCTS_PATH}
          className="text-xs text-accent hover:text-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          {t('admin.dashboard.viewAll')}
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="size-14 rounded-2xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-5 w-12" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title={t('admin.dashboard.topProducts.emptyTitle')}
          description={t('admin.dashboard.topProducts.emptyDescription')}
        />
      ) : (
        <ul className="space-y-4">
          {products.map((product) => (
            <li key={product.id} className="flex items-center gap-4">
              <div className="admin-glass flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl p-[7.2px]">
                <img
                  src={resolveProductImageUrl(product.image)}
                  alt=""
                  className="size-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-primary-text">
                  {product.name}
                </p>
                <p className="text-xs text-secondary-text">
                  {t('admin.dashboard.topProducts.unitsSold', {
                    count: product.unitsSold,
                    formatted: formatDashboardNumber(product.unitsSold, locale),
                  })}
                </p>
              </div>
              <p className="shrink-0 text-base font-bold tabular-nums text-accent">
                {formatDashboardMoney(product.price, locale)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  )
}
