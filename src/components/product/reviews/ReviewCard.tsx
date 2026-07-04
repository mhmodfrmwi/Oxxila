// src/components/product/reviews/ReviewCard.tsx
import { Languages, ThumbsUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { StarDisplay } from './StarDisplay'
import type { Review } from './types'

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { t } = useTranslation()
  const titleId = review.title ? `review-title-${review.id}` : undefined

  return (
    <article aria-labelledby={titleId}>
      <div className="review-card-header">
        <StarDisplay rating={review.rating} size={14} className="review-card-stars" />
        {review.date && (
          <time className="review-card-date" dateTime={review.date}>
            {review.date}
          </time>
        )}
      </div>

      {review.title && (
        <h3 id={titleId} className="review-card-title">
          {review.title}
        </h3>
      )}

      <p className="review-card-comment">{review.comment}</p>

      {(review.name || review.avatar) && (
        <div className="review-card-reviewer">
          {review.avatar && (
            <img src={review.avatar} alt="" className="review-card-avatar" loading="lazy" />
          )}
          {review.name && <span className="review-card-name">{review.name}</span>}
        </div>
      )}

      <div className="review-card-footer">
        <button type="button" className="review-card-action">
          <ThumbsUp size={16} strokeWidth={1.5} aria-hidden />
          <span>{t('productDetail.reviews.helpful', { count: review.helpful })}</span>
        </button>
        <button type="button" className="review-card-action">
          <Languages size={16} strokeWidth={1.5} aria-hidden />
          <span>{t('productDetail.reviews.translate')}</span>
        </button>
      </div>
    </article>
  )
}
