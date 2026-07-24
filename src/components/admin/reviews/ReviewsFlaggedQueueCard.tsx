// src/components/admin/reviews/ReviewsFlaggedQueueCard.tsx
import { Flag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AdminFlaggedQueue } from '../../../types/adminReviews'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import { formatReviewRelativeTime } from '../../../utils/adminReviewsFormat'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'
import { StatusBadge } from '../ui/StatusBadge'

interface ReviewsFlaggedQueueCardProps {
  data: AdminFlaggedQueue | null
  loading?: boolean
  queueLoading?: boolean
  onPageChange: (page: number) => void
  onOpenReview?: (reviewId: string) => void
}

export function ReviewsFlaggedQueueCard({
  data,
  loading = false,
  queueLoading = false,
  onPageChange,
  onOpenReview,
}: ReviewsFlaggedQueueCardProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const empty = !loading && (!data || data.items.length === 0)
  const currentPage = data?.pagination?.currentPage ?? 1
  const totalPages = Math.max(data?.pagination?.numberOfPages ?? 1, 1)
  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages && totalPages > 1
  const urgentCount = data?.urgent ?? data?.count ?? 0

  return (
    <GlassCard
      strong
      className="flex min-w-0 flex-1 flex-col gap-6 rounded-[var(--admin-radius-2xl)]"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[14.4px] leading-7 font-bold text-white">
          {t('admin.reviews.overview.flaggedQueue.title')}
        </h2>
        {loading ? (
          <Skeleton className="h-5 w-16 rounded-full" />
        ) : urgentCount > 0 ? (
          <StatusBadge tone="danger" className="gap-1">
            <Flag size={9} aria-hidden />
            {t('admin.reviews.overview.flaggedQueue.urgent', { count: urgentCount })}
          </StatusBadge>
        ) : null}
      </div>

      {loading || !data ? (
        <div className="space-y-4" aria-hidden>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      ) : empty ? (
        <EmptyState
          bare
          title={t('admin.reviews.overview.flaggedQueue.emptyTitle')}
          description={t('admin.reviews.overview.flaggedQueue.emptyDescription')}
        />
      ) : (
        <ul className={cn('flex flex-col gap-4', queueLoading && 'opacity-60')}>
          {data.items.map((item) => (
            <li
              key={item.id}
              className="border-b border-border-subtle/50 pb-4 last:border-b-0 last:pb-0"
            >
              <button
                type="button"
                onClick={() => onOpenReview?.(item.id)}
                className={cn(
                  'flex w-full flex-col gap-1 rounded-xl text-start transition-colors hover:bg-white/[0.03]',
                  focusRingClasses,
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-primary-text">
                    {item.reviewRef}
                  </span>
                  <time className="shrink-0 text-xs text-secondary-text" dateTime={item.updatedAt}>
                    {formatReviewRelativeTime(item.updatedAt, locale)}
                  </time>
                </div>
                <p className="truncate text-xs text-secondary-text" title={item.snippet}>
                  {item.snippet}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {!loading && !empty && totalPages > 1 ? (
        <div
          className="flex items-center justify-end gap-2"
          role="group"
          aria-label={t('admin.reviews.overview.flaggedQueue.paginationAria')}
        >
          <button
            type="button"
            disabled={!canGoPrev || queueLoading}
            onClick={() => onPageChange(currentPage - 1)}
            className={cn(
              'rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/50',
              'transition-colors hover:bg-white/10 hover:text-white/80',
              'disabled:cursor-not-allowed disabled:opacity-40',
              focusRingClasses,
            )}
          >
            {t('admin.reviews.prev')}
          </button>
          <button
            type="button"
            disabled={!canGoNext || queueLoading}
            onClick={() => onPageChange(currentPage + 1)}
            className={cn(
              'rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white',
              'transition-opacity hover:opacity-95',
              'disabled:cursor-not-allowed disabled:opacity-40',
              focusRingClasses,
            )}
          >
            {t('admin.reviews.next')}
          </button>
        </div>
      ) : null}
    </GlassCard>
  )
}
