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
  className,
  initialVisibleCount = 3,
  onWriteReview,
  onViewAll,
}: ReviewsSectionProps) {
  const visibleReviews = reviews.slice(0, initialVisibleCount)
  const totalDocuments = reviewsTotalDocuments ?? totalReviews
  const showViewAll = totalDocuments > initialVisibleCount

  return (
    <section className={cn('reviews-section', className)} aria-label="Customer reviews">
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
            <div className="reviews-list">
              {visibleReviews.length > 0 ? (
                visibleReviews.map((review) => (
                  <div key={review.id} className="reviews-list-item">
                    <ReviewCard review={review} />
                  </div>
                ))
              ) : (
                <p className="text-sm text-secondary-text">No reviews yet.</p>
              )}
            </div>

            {showViewAll && (
              <div className="reviews-view-all-wrap">
                <Button
                  type="button"
                  variant="outline"
                  pill
                  className="reviews-view-all-btn !border"
                  onClick={onViewAll}
                >
                  View all comments
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
