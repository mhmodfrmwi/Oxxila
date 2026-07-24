// src/components/admin/reviews/ReviewsSentimentCard.tsx
import { useTranslation } from 'react-i18next'
import type { AdminReviewsSentiment } from '../../../types/adminReviews'
import { cn } from '../../../lib/cn'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'

interface ReviewsSentimentCardProps {
  data: AdminReviewsSentiment | null
  loading?: boolean
}

type SentimentKey = 'positive' | 'neutral' | 'negative'

const SENTIMENT_ORDER: readonly SentimentKey[] = ['positive', 'neutral', 'negative']

const barToneClasses: Record<SentimentKey, string> = {
  positive: 'bg-support-success',
  neutral: 'bg-support-warning',
  negative: 'bg-support-error',
}

const dotToneClasses: Record<SentimentKey, string> = {
  positive: 'bg-support-success',
  neutral: 'bg-support-warning',
  negative: 'bg-support-error',
}

export function ReviewsSentimentCard({
  data,
  loading = false,
}: ReviewsSentimentCardProps) {
  const { t } = useTranslation()
  const empty = !loading && (!data || data.totalReviews === 0)

  return (
    <GlassCard
      strong
      className="flex min-w-0 flex-1 flex-col gap-6 rounded-[var(--admin-radius-2xl)]"
    >
      <div className="space-y-1">
        <h2 className="text-[14.4px] leading-7 font-bold text-white">
          {t('admin.reviews.overview.sentiment.title')}
        </h2>
        <p className="text-sm text-secondary-text">
          {t('admin.reviews.overview.sentiment.subtitle')}
        </p>
      </div>

      {loading || !data ? (
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : empty ? (
        <EmptyState
          bare
          title={t('admin.reviews.overview.sentiment.emptyTitle')}
          description={t('admin.reviews.overview.sentiment.emptyDescription')}
        />
      ) : (
        <ul className="flex flex-col gap-5">
          {SENTIMENT_ORDER.map((key) => (
            <li key={key} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-primary-text">
                  <span
                    className={cn('size-2 rounded-full', dotToneClasses[key])}
                    aria-hidden
                  />
                  {t(`admin.reviews.overview.sentiment.${key}`)}
                </span>
                <span className="text-sm font-semibold tabular-nums text-primary-text">
                  {data[key]}%
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-valuenow={data[key]}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t(`admin.reviews.overview.sentiment.${key}`)}
              >
                <div
                  className={cn('h-full rounded-full transition-[width]', barToneClasses[key])}
                  style={{ width: `${Math.min(Math.max(data[key], 0), 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  )
}
