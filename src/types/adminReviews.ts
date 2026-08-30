// src/types/adminReviews.ts

/** Backend `tab` query values — also drives the Figma status pills 1:1. */
export type AdminReviewsApiTab = 'all' | 'visible' | 'hidden' | 'flagged'

/** Normalized row for the Reviews list table. */
export interface AdminReviewRow {
  id: string
  reviewerName: string
  reviewerAvatar: string | null
  reviewerInitials: string
  reviewerOrdersLabel: string
  productName: string
  rating: number
  feedback: string
  isVisible: boolean
  isFlagged: boolean
  createdAt: string
}

/** Raw list item from GET /api/v1/reviews/admin (+ overview.recentReviews). */
export interface ApiAdminReview {
  id: string
  user?: {
    id?: string
    name?: string
    avatar?: string
    totalOrders?: number
  } | null
  product?: {
    id?: string
    name?: string
  } | null
  rating: number
  feedback?: string
  isVisible: boolean
  isFlagged?: boolean
  createdAt: string
}

/** Raw detail from GET /api/v1/reviews/admin/:id. */
export interface ApiAdminReviewDetail {
  id: string
  title?: string | null
  comment: string
  rating: number
  likesCount?: number
  isVisible: boolean
  isFlagged?: boolean
  createdAt: string
  updatedAt?: string
  user?: {
    id?: string
    name?: string
    email?: string
    phone?: string
    avatar?: string
    role?: string
    active?: boolean
    totalOrders?: number
    createdAt?: string
  } | null
  product?: {
    id?: string
    name?: string
    slug?: string
    images?: string[]
    price?: number
    priceAfterDiscount?: number | null
    offerEndsAt?: string | null
  } | null
}

export interface AdminReviewDetail {
  id: string
  title: string | null
  comment: string
  rating: number
  likesCount: number
  isVisible: boolean
  isFlagged: boolean
  createdAt: string
  updatedAt: string | null
  reviewer: {
    id: string | null
    name: string
    email: string | null
    phone: string | null
    avatar: string | null
    initials: string
    totalOrders: number
    active: boolean
  }
  product: {
    id: string | null
    name: string
    image: string | null
    price: number | null
  }
}

export interface AdminReviewsListParams {
  page?: number
  limit?: number
  sort?: string
  keyword?: string
  tab?: AdminReviewsApiTab
}

/** Raw payload from PATCH /reviews/:id/visibility and PATCH /reviews/:id/flag. */
export interface ApiAdminReviewMutationResult {
  id: string
  isVisible: boolean
  isFlagged: boolean
}

// --- Overview widgets: GET /reviews/admin/overview + standalone endpoints ---

export interface ApiRatingBreakdownItem {
  star: number
  count: number
  percentage: number
}

export interface ApiAdminReviewsAverageRating {
  value: number
  totalReviews: number
  breakdown: ApiRatingBreakdownItem[]
}

export interface ApiAdminReviewsRatingDistribution {
  positive: number
  neutral: number
  negative: number
  counts: {
    positive: number
    neutral: number
    negative: number
  }
  totalReviews: number
}

export interface ApiAdminFlaggedQueueItem {
  id: string
  reviewRef: string
  snippet: string
  isFlagged?: boolean
  updatedAt: string
}

export interface ApiAdminFlaggedQueuePagination {
  currentPage: number
  limit: number
  numberOfPages: number
  totalDocuments: number
  nextPage: number | null
  prevPage: number | null
}

export interface ApiAdminFlaggedQueue {
  count: number
  urgent: number
  items: ApiAdminFlaggedQueueItem[]
  pagination: ApiAdminFlaggedQueuePagination
}

export interface ApiAdminReviewsOverview {
  averageRating: ApiAdminReviewsAverageRating
  ratingDistribution: ApiAdminReviewsRatingDistribution
  flaggedQueue: ApiAdminFlaggedQueue
  recentReviews: {
    data: ApiAdminReview[]
    pagination: ApiAdminFlaggedQueuePagination
  }
}

export interface AdminReviewsOverviewParams {
  limit?: number
  queuePage?: number
  queueLimit?: number
}

export interface AdminFlaggedQueueParams {
  page?: number
  limit?: number
}

export interface AdminRatingBreakdownItem {
  star: number
  count: number
  percentage: number
}

export interface AdminReviewsAverageRating {
  value: number
  totalReviews: number
  breakdown: AdminRatingBreakdownItem[]
}

export interface AdminReviewsSentiment {
  positive: number
  neutral: number
  negative: number
  totalReviews: number
}

export interface AdminFlaggedQueueItem {
  id: string
  reviewRef: string
  snippet: string
  updatedAt: string
}

export interface AdminFlaggedQueue {
  count: number
  urgent: number
  items: AdminFlaggedQueueItem[]
  pagination: ApiAdminFlaggedQueuePagination | null
}
