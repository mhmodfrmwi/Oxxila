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
}

export interface ReviewsSectionProps {
  averageRating: number
  totalReviews: number
  distribution: RatingDistribution[]
  reviews: Review[]
  reviewsTotalDocuments?: number
  loading?: boolean
  className?: string
  initialVisibleCount?: number
  onWriteReview?: () => void
  onViewAll?: () => void
}
