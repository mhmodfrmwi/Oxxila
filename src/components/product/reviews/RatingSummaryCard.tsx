// src/components/product/reviews/RatingSummaryCard.tsx
import { useTranslation } from 'react-i18next'
import { Button } from '../../ui/Button'
import { RatingBar } from './RatingBar'
import { StarDisplay } from './StarDisplay'
import type { RatingDistribution } from './types'

interface RatingSummaryCardProps {
  averageRating: number
  totalReviews: number
  distribution: RatingDistribution[]
  onWriteReview?: () => void
}

export function RatingSummaryCard({
  averageRating,
  totalReviews,
  distribution,
  onWriteReview,
}: RatingSummaryCardProps) {
  const { t } = useTranslation()
  const formattedRating = averageRating.toFixed(1)

  return (
    <article className="reviews-summary-card">
      <div className="reviews-summary-header">
        <span
          className="reviews-summary-score"
          aria-label={t('productDetail.reviews.outOfFive', { rating: formattedRating })}
        >
          {formattedRating}
        </span>
        <StarDisplay rating={averageRating} size={16} className="reviews-summary-stars" />
      </div>

      <p className="reviews-summary-count">
        {t('productDetail.reviews.basedOn', { count: totalReviews })}
      </p>

      <div
        className="reviews-summary-distribution"
        aria-label={t('productDetail.reviews.distribution')}
      >
        {distribution.map((item) => (
          <RatingBar key={item.stars} item={item} />
        ))}
      </div>

      <Button
        type="button"
        variant="primary"
        pill
        fullWidth
        className="reviews-summary-cta"
        onClick={onWriteReview}
      >
        {t('productDetail.reviews.writeReview')}
      </Button>
    </article>
  )
}
