// src/types/adminReviews.ts

/** Figma status pills mapped onto GET /reviews/admin `tab`. */
export type AdminReviewsStatusTab =
  | 'all'
  | 'pending'
  | 'approved'
  | 'reported'

/** Backend `tab` query values. */
export type AdminReviewsApiTab =
  | 'all'
  | 'visible'
  | 'hidden'
  | 'flagged'
  | 'resolved'

export type AdminReviewModerationStatus = 'none' | 'flagged' | 'resolved'

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
  moderationStatus: AdminReviewModerationStatus
  moderationBadge: string | null
  createdAt: string
}

/** Raw list item from GET /api/v1/reviews/admin. */
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
  moderationStatus?: AdminReviewModerationStatus
  moderationBadge?: string | null
  flagReason?: string | null
  resolvedNote?: string | null
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
  moderationStatus?: AdminReviewModerationStatus
  moderationBadge?: string | null
  flagReason?: string | null
  flaggedAt?: string | null
  flaggedBy?: { id?: string; name?: string } | null
  resolvedAt?: string | null
  resolvedBy?: { id?: string; name?: string } | null
  resolvedNote?: string | null
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
  } | null
}

export interface AdminReviewDetail {
  id: string
  title: string | null
  comment: string
  rating: number
  likesCount: number
  isVisible: boolean
  moderationStatus: AdminReviewModerationStatus
  moderationBadge: string | null
  flagReason: string | null
  flaggedAt: string | null
  flaggedByName: string | null
  resolvedAt: string | null
  resolvedByName: string | null
  resolvedNote: string | null
  createdAt: string
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
