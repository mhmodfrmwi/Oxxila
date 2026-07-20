export interface RatingDistribution {
  stars: number
  percentage: number
}

export interface Review {
  id: string
  name: string
  avatar: string
  date: string
  rating: number
  title: string
  comment: string
  helpful: number
  liked?: boolean
  isOwn?: boolean
}

export interface ReviewsSectionProps {
  averageRating: number
  totalReviews: number
  distribution: RatingDistribution[]
  reviews: Review[]
  reviewsTotalDocuments?: number
  loading?: boolean
  loadingMore?: boolean
  error?: string | null
  className?: string
  initialVisibleCount?: number
  hasMoreReviews?: boolean
  onWriteReview?: () => void
  onLoadMore?: () => void | Promise<void>
  onToggleHelpful?: (reviewId: string) => void
  onDeleteReview?: (reviewId: string) => void
  pendingReviewId?: string | null
}
