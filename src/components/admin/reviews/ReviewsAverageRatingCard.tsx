// src/components/admin/reviews/ReviewsAverageRatingCard.tsx
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AdminReviewsAverageRating } from '../../../types/adminReviews'
import { formatCount } from '../../../utils/adminReviewsFormat'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'

interface ReviewsAverageRatingCardProps {
  data: AdminReviewsAverageRating | null
  loading?: boolean
}

export function ReviewsAverageRatingCard({
  data,
  loading = false,
}: ReviewsAverageRatingCardProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const empty = !loading && (!data || data.totalReviews === 0)

  return (
    <GlassCard
      strong
      className="flex min-w-0 flex-1 flex-col gap-6 rounded-[var(--admin-radius-2xl)]"
    >
      <h2 className="text-[14.4px] leading-7 font-bold text-white">
        {t('admin.reviews.overview.averageRating.title')}
      </h2>

      {loading || !data ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-end gap-3">
            <Skeleton className="h-10 w-16" />
            <Skeleton className="mb-1 h-4 w-24" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-3 w-full" />
            ))}
          </div>
        </div>
      ) : empty ? (
        <EmptyState
          bare
          title={t('admin.reviews.overview.averageRating.emptyTitle')}
          description={t('admin.reviews.overview.averageRating.emptyDescription')}
        />
      ) : (
        <>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-bold tabular-nums text-primary-text">
              {data.value.toFixed(1)}
            </p>
            <div className="flex items-center gap-1 pb-1.5">
              <Star
                size={16}
                className="fill-support-warning text-support-warning"
                strokeWidth={1.5}
                aria-hidden
              />
              <span className="text-xs text-secondary-text">
                {t('admin.reviews.overview.averageRating.subtitle', {
                  count: formatCount(data.totalReviews, locale),
                })}
              </span>
            </div>
          </div>

          <ul className="flex flex-col gap-2.5">
            {data.breakdown.map((item) => (
              <li key={item.star} className="flex items-center gap-3">
                <span className="flex w-6 shrink-0 items-center gap-1 text-xs text-white/60">
                  {item.star}
                  <Star
                    size={10}
                    className="fill-support-warning text-support-warning"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </span>
                <div
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"
                  role="progressbar"
                  aria-valuenow={item.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={t('admin.reviews.ratingAria', { rating: item.star })}
                >
                  <div
                    className="h-full rounded-full bg-support-warning transition-[width]"
                    style={{ width: `${Math.min(Math.max(item.percentage, 0), 100)}%` }}
                  />
                </div>
                <span className="w-9 shrink-0 text-end text-xs tabular-nums text-white/40">
                  {item.percentage}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </GlassCard>
  )
}
