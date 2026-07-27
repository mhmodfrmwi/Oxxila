// src/components/admin/dashboard/DashboardLowStockCard.tsx
import { AlertTriangle } from 'lucide-react'
import { useEffect, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { DashboardLowStockItem } from '../../../types/adminDashboard'
import { cn } from '../../../lib/cn'
import { resolveProductImageUrl } from '../../../utils/productImage'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'
import { StatusBadge, type StatusBadgeTone } from '../ui/StatusBadge'

/** Matches GET /dashboard lowStockThreshold validator (min 1, max 1000). */
export const LOW_STOCK_THRESHOLD_MIN = 1
export const LOW_STOCK_THRESHOLD_MAX = 1000
export const LOW_STOCK_THRESHOLD_DEFAULT = 10

interface DashboardLowStockCardProps {
  items: readonly DashboardLowStockItem[]
  /** Alert threshold from GET /dashboard `lowStock.threshold`. */
  threshold?: number | null
  /** Draft / committed threshold used for the query param. */
  thresholdValue: number
  onThresholdChange: (value: number) => void
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

function resolveStockBadge(
  item: DashboardLowStockItem,
  t: (key: string) => string,
): { label: string; tone: StatusBadgeTone } {
  if (item.stock <= 0) {
    return {
      label: t('admin.dashboard.lowStock.status.outOfStock'),
      tone: 'danger',
    }
  }
  if (item.isCritical) {
    return {
      label: t('admin.dashboard.lowStock.status.critical'),
      tone: 'danger',
    }
  }
  return {
    label: t('admin.dashboard.lowStock.status.low'),
    tone: 'warning',
  }
}

function clampThreshold(value: number): number {
  if (!Number.isFinite(value)) return LOW_STOCK_THRESHOLD_DEFAULT
  return Math.min(
    LOW_STOCK_THRESHOLD_MAX,
    Math.max(LOW_STOCK_THRESHOLD_MIN, Math.round(value)),
  )
}

export function DashboardLowStockCard({
  items,
  threshold = null,
  thresholdValue,
  onThresholdChange,
  loading = false,
  error = null,
  onRetry,
}: DashboardLowStockCardProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState(String(thresholdValue))

  useEffect(() => {
    setDraft(String(thresholdValue))
  }, [thresholdValue])

  function commitDraft(raw: string) {
    const parsed = Number.parseInt(raw, 10)
    const next = clampThreshold(Number.isFinite(parsed) ? parsed : thresholdValue)
    setDraft(String(next))
    if (next !== thresholdValue) onThresholdChange(next)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitDraft(draft)
      event.currentTarget.blur()
    }
  }

  return (
    <GlassCard
      strong
      className="flex min-w-0 flex-1 flex-col gap-6 rounded-[var(--admin-radius-2xl)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-[14.4px] leading-7 font-bold text-white">
          {t('admin.dashboard.lowStock.title')}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          <label className="flex items-center gap-1.5">
            <span className="hidden text-[8px] font-bold uppercase tracking-[0.06em] text-white/40 sm:inline">
              {t('admin.dashboard.lowStock.thresholdLabel')}
            </span>
            <span className="sr-only sm:hidden">
              {t('admin.dashboard.lowStock.thresholdLabel')}
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={LOW_STOCK_THRESHOLD_MIN}
              max={LOW_STOCK_THRESHOLD_MAX}
              step={1}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={() => commitDraft(draft)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              aria-label={t('admin.dashboard.lowStock.thresholdLabel')}
              className={cn(
                'admin-glass w-14 rounded-lg border border-white/10 bg-white/5 px-2 py-1',
                'text-center text-xs font-semibold tabular-nums text-primary-text',
                'placeholder:text-placeholder-text',
                'disabled:cursor-not-allowed disabled:opacity-60',
                focusRingClasses,
              )}
            />
          </label>
          <AlertTriangle
            size={19}
            className="shrink-0 text-support-error"
            aria-hidden
          />
        </div>
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
              <Skeleton className="h-5 w-14" />
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title={t('admin.dashboard.lowStock.errorTitle')}
          description={error}
          action={
            onRetry ? (
              <Button type="button" variant="outline" onClick={onRetry}>
                {t('admin.dashboard.retry')}
              </Button>
            ) : undefined
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          title={t('admin.dashboard.lowStock.emptyTitle')}
          description={t('admin.dashboard.lowStock.emptyDescription')}
        />
      ) : (
        <ul className="space-y-4">
          {items.map((item) => {
            const badge = resolveStockBadge(item, t)
            return (
              <li key={String(item.id)} className="flex items-center gap-4">
                <div className="admin-glass flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl p-[7.2px]">
                  <img
                    src={resolveProductImageUrl(item.image)}
                    alt=""
                    className="size-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm font-semibold text-primary-text">
                    {item.name}
                  </p>
                  <p className="text-xs text-secondary-text">
                    {t('admin.dashboard.lowStock.left', { count: item.stock })}
                    {typeof threshold === 'number' ? (
                      <span className="text-secondary-text/80">
                        {' · '}
                        {t('admin.dashboard.lowStock.threshold', {
                          count: threshold,
                        })}
                      </span>
                    ) : null}
                  </p>
                </div>
                <StatusBadge tone={badge.tone} className="shrink-0">
                  {badge.label}
                </StatusBadge>
              </li>
            )
          })}
        </ul>
      )}
    </GlassCard>
  )
}
