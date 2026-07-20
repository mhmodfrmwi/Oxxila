// src/components/product/reviews/ReviewsSection.tsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import { Button } from '../../ui/Button'
import { RatingSummaryCard } from './RatingSummaryCard'
import { ReviewCard } from './ReviewCard'
import type { ReviewsSectionProps } from './types'
import '../../../styles/reviews-section.css'

export type {
  RatingDistribution,
  Review,
  ReviewsSectionProps,
} from './types'

function ReviewsSectionSkeleton() {
  return (
    <div className="reviews-section-grid animate-pulse" aria-hidden>
      <div className="reviews-summary-card">
        <div className="h-10 w-24 rounded bg-surface-muted" />
        <div className="mt-4 h-4 w-40 rounded bg-surface-muted" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-3 rounded bg-surface-muted" />
          ))}
        </div>
      </div>
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-32 rounded-[20px] bg-surface-muted" />
        ))}
      </div>
    </div>
  )
}

export function ReviewsSection({
  averageRating,
  totalReviews,
  distribution,
  reviews,
  reviewsTotalDocuments,
  loading = false,
  loadingMore = false,
  error = null,
  className,
  initialVisibleCount = 3,
  hasMoreReviews = false,
  onWriteReview,
  onLoadMore,
  onToggleHelpful,
  onDeleteReview,
  pendingReviewId = null,
}: ReviewsSectionProps) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const totalDocuments = reviewsTotalDocuments ?? totalReviews
  const visibleReviews = expanded ? reviews : reviews.slice(0, initialVisibleCount)
  const showExpandLocal = !expanded && reviews.length > initialVisibleCount
  const showLoadMore =
    expanded && hasMoreReviews && typeof onLoadMore === 'function'
  const showViewAll = !expanded && (showExpandLocal || totalDocuments > initialVisibleCount)

  useEffect(() => {
    setExpanded(false)
  }, [totalDocuments])

  async function handleViewAll() {
    setExpanded(true)
    if (hasMoreReviews && onLoadMore) {
      await onLoadMore()
    }
  }

  return (
    <section
      className={cn('reviews-section', className)}
      aria-label={t('productDetail.reviews.ariaLabel')}
    >
      {loading ? (
        <ReviewsSectionSkeleton />
      ) : (
        <div className="reviews-section-grid">
          <RatingSummaryCard
            averageRating={averageRating}
            totalReviews={totalReviews}
            distribution={distribution}
            onWriteReview={onWriteReview}
          />

          <div>
            {error && (
              <p className="mb-4 text-sm text-support-error" role="alert">
                {error}
              </p>
            )}

            <div className="reviews-list">
              {visibleReviews.length > 0 ? (
                visibleReviews.map((review) => (
                  <div key={review.id} className="reviews-list-item">
                    <ReviewCard
                      review={review}
                      pending={pendingReviewId === review.id}
                      onToggleHelpful={onToggleHelpful}
                      onDelete={onDeleteReview}
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-secondary-text">{t('productDetail.reviews.empty')}</p>
              )}
            </div>

            {showViewAll && (
              <div className="reviews-view-all-wrap">
                <Button
                  type="button"
                  variant="outline"
                  pill
                  className="reviews-view-all-btn !border"
                  onClick={() => void handleViewAll()}
                  disabled={loadingMore}
                  aria-busy={loadingMore || undefined}
                >
                  {loadingMore
                    ? t('productDetail.reviews.loadingMore')
                    : t('productDetail.reviews.viewAll')}
                </Button>
              </div>
            )}

            {showLoadMore && (
              <div className="reviews-view-all-wrap">
                <Button
                  type="button"
                  variant="outline"
                  pill
                  className="reviews-view-all-btn !border"
                  onClick={() => void onLoadMore?.()}
                  disabled={loadingMore}
                  aria-busy={loadingMore || undefined}
                >
                  {loadingMore
                    ? t('productDetail.reviews.loadingMore')
                    : t('productDetail.reviews.loadMore')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
