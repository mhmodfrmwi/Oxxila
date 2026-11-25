// src/components/product/reviews/ReviewCard.tsx
import { ThumbsUp, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import { StarDisplay } from './StarDisplay'
import type { Review } from './types'

interface ReviewCardProps {
  review: Review
  pending?: boolean
  onToggleHelpful?: (reviewId: string) => void
  onDelete?: (reviewId: string) => void
}

export function ReviewCard({
  review,
  pending = false,
  onToggleHelpful,
  onDelete,
}: ReviewCardProps) {
  const { t } = useTranslation()
  const titleId = review.title ? `review-title-${review.id}` : undefined

  return (
    <article aria-labelledby={titleId} className="review-card">
      <div className="review-card-top">
        <div className="review-card-reviewer">
          {review.avatar ? (
            <img src={review.avatar} alt="" className="review-card-avatar" loading="lazy" />
          ) : (
            // Initials fallback keeps every card visually anchored when no photo exists.
            <span className="review-card-avatar review-card-avatar--initials" aria-hidden>
              {(review.name || '?').trim().charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            {review.name && <span className="review-card-name">{review.name}</span>}
            <StarDisplay rating={review.rating} size={13} className="review-card-stars" />
          </div>
        </div>
        {review.date && (
          <time className="review-card-date" dateTime={review.date}>
            {review.date}
          </time>
        )}
      </div>

      {review.title && (
        <h3 id={titleId} className="review-card-title" dir="auto">
          {review.title}
        </h3>
      )}

      {/* dir="auto": an Arabic review in an English page (or the reverse) reads in its own direction. */}
      <p className="review-card-comment" dir="auto">
        {review.comment}
      </p>

      <div className="review-card-footer">
        <button
          type="button"
          className={cn(
            'review-card-action',
            review.liked && 'text-accent',
            pending && 'pointer-events-none opacity-60',
          )}
          disabled={pending}
          aria-pressed={review.liked ? true : undefined}
          aria-busy={pending || undefined}
          onClick={() => onToggleHelpful?.(review.id)}
        >
          <ThumbsUp
            size={16}
            strokeWidth={1.5}
            aria-hidden
            className={cn(review.liked && 'fill-accent')}
          />
          <span>{t('productDetail.reviews.helpful', { count: review.helpful })}</span>
        </button>
        {review.isOwn && onDelete && (
          <button
            type="button"
            className={cn(
              'review-card-action text-support-error',
              pending && 'pointer-events-none opacity-60',
            )}
            disabled={pending}
            aria-busy={pending || undefined}
            onClick={() => onDelete(review.id)}
          >
            <Trash2 size={16} strokeWidth={1.5} aria-hidden />
            <span>{t('productDetail.reviews.delete')}</span>
          </button>
        )}
      </div>
    </article>
  )
}
