// src/components/admin/dashboard/DashboardLowStockCard.tsx
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { DashboardLowStockItem } from '../../../types/adminDashboard'
import { cn } from '../../../lib/cn'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'

interface DashboardLowStockCardProps {
  items: readonly DashboardLowStockItem[]
  loading?: boolean
}

export function DashboardLowStockCard({
  items,
  loading = false,
}: DashboardLowStockCardProps) {
  const { t } = useTranslation()

  return (
    <GlassCard className="flex flex-col gap-6 rounded-[var(--admin-radius-lg)]">
      <div className="flex items-center gap-2">
        <AlertTriangle
          size={18}
          className="shrink-0 text-support-error"
          aria-hidden
        />
        <h2 className="text-lg font-bold text-primary-text">
          {t('admin.dashboard.lowStock.title')}
        </h2>
      </div>

      {loading ? (
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between gap-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title={t('admin.dashboard.lowStock.emptyTitle')}
          description={t('admin.dashboard.lowStock.emptyDescription')}
        />
      ) : (
        <ul className="space-y-5">
          {items.map((item) => (
            <li key={item.id} className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-medium text-primary-text">
                  {item.name}
                </p>
                <span
                  className={cn(
                    'shrink-0 text-xs font-semibold',
                    item.isCritical ? 'text-support-error' : 'text-secondary-text',
                  )}
                >
                  {t('admin.dashboard.lowStock.left', { count: item.stock })}
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-valuenow={Math.round(item.stockLevel)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={item.name}
              >
                <div
                  className={cn(
                    'h-full rounded-full transition-[width]',
                    item.isCritical ? 'bg-support-error' : 'bg-support-warning',
                  )}
                  style={{ width: `${Math.min(Math.max(item.stockLevel, 4), 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  )
}
