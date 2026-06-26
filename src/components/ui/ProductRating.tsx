import { Star } from 'lucide-react'
import { cn } from '../../lib/cn'
import { formatReviewCount } from '../../utils/formatReviewCount'

interface ProductRatingProps {
  rating: number
  reviewCount: number
  className?: string
  starSize?: number
  variant?: 'card' | 'detail'
}

function StarRow({
  rating,
  size,
  gapClassName = 'gap-0.5',
}: {
  rating: number
  size: number
  gapClassName?: string
}) {
  return (
    <div className={cn('flex items-center', gapClassName)} aria-hidden>
      {Array.from({ length: 5 }, (_, index) => {
        const fillAmount = Math.min(1, Math.max(0, rating - index))
        const isFilled = fillAmount >= 1
        const isPartial = fillAmount > 0 && fillAmount < 1

        return (
          <Star
            key={index}
            size={size}
            className={cn(
              isFilled || isPartial
                ? 'fill-support-warning text-support-warning'
                : 'fill-transparent text-support-warning/35',
            )}
            strokeWidth={1.5}
          />
        )
      })}
    </div>
  )
}

export function ProductRating({
  rating,
  reviewCount,
  className,
  starSize = 12,
  variant = 'card',
}: ProductRatingProps) {
  if (variant === 'detail') {
    return (
      <div
        className={cn('product-detail-rating flex flex-wrap items-center gap-x-3 gap-y-1', className)}
        aria-label={`${rating} out of 5 stars, ${formatReviewCount(reviewCount)} reviews`}
      >
        <StarRow rating={rating} size={starSize} gapClassName="gap-[3px]" />
        <span className="product-detail-rating-reviews">
          {formatReviewCount(reviewCount)} reviews
        </span>
      </div>
    )
  }

  return (
    <div className={cn('flex shrink-0 items-center gap-1 text-xs text-secondary-text', className)}>
      <Star
        size={starSize}
        className="fill-support-warning text-support-warning"
        aria-hidden
      />
      <span>
        {rating} ({formatReviewCount(reviewCount)})
      </span>
    </div>
  )
}
