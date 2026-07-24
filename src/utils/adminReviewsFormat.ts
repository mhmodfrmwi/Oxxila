// src/utils/adminReviewsFormat.ts
import type {
  AdminFlaggedQueue,
  AdminReviewDetail,
  AdminReviewRow,
  AdminReviewsAverageRating,
  AdminReviewsSentiment,
  ApiAdminFlaggedQueue,
  ApiAdminReview,
  ApiAdminReviewDetail,
  ApiAdminReviewsAverageRating,
  ApiAdminReviewsRatingDistribution,
} from '../types/adminReviews'
import {
  formatDashboardDate,
  formatDashboardMoney,
  formatRelativeTime,
  resolveDashboardLocale,
} from './adminDashboardFormat'
import { customerInitials } from './adminOrdersFormat'

export function formatReviewDate(value: string, locale = 'en'): string {
  return formatDashboardDate(value, locale)
}

export function formatReviewRelativeTime(value: string, locale = 'en'): string {
  return formatRelativeTime(value, locale)
}

export function formatCount(value: number, locale = 'en'): string {
  return new Intl.NumberFormat(resolveDashboardLocale(locale)).format(value)
}

export function formatReviewMoney(value: number, locale = 'en'): string {
  return formatDashboardMoney(value, locale)
}

export function mapApiReviewToAdminRow(
  review: ApiAdminReview,
  ordersLabel: (count: number) => string,
): AdminReviewRow {
  const id = String(review.id)
  const name = review.user?.name?.trim() || '—'
  const avatar = review.user?.avatar?.trim() || null
  const totalOrders = review.user?.totalOrders ?? 0

  return {
    id,
    reviewerName: name,
    reviewerAvatar: avatar,
    reviewerInitials: customerInitials(name === '—' ? '' : name),
    reviewerOrdersLabel: ordersLabel(totalOrders),
    productName: review.product?.name?.trim() || '—',
    rating: Number(review.rating) || 0,
    feedback: review.feedback?.trim() || '—',
    isVisible: Boolean(review.isVisible),
    isFlagged: Boolean(review.isFlagged),
    createdAt: review.createdAt,
  }
}

export function mapApiReviewToAdminDetail(
  review: ApiAdminReviewDetail,
): AdminReviewDetail {
  const name = review.user?.name?.trim() || '—'
  const productImages = review.product?.images ?? []
  const productImage = productImages.find((url) => Boolean(url?.trim())) ?? null

  return {
    id: String(review.id),
    title: review.title?.trim() || null,
    comment: review.comment?.trim() || '—',
    rating: Number(review.rating) || 0,
    likesCount: Number(review.likesCount) || 0,
    isVisible: Boolean(review.isVisible),
    isFlagged: Boolean(review.isFlagged),
    createdAt: review.createdAt,
    updatedAt: review.updatedAt ?? null,
    reviewer: {
      id: review.user?.id ? String(review.user.id) : null,
      name,
      email: review.user?.email?.trim() || null,
      phone: review.user?.phone?.trim() || null,
      avatar: review.user?.avatar?.trim() || null,
      initials: customerInitials(name === '—' ? '' : name),
      totalOrders: review.user?.totalOrders ?? 0,
      active: review.user?.active !== false,
    },
    product: {
      id: review.product?.id ? String(review.product.id) : null,
      name: review.product?.name?.trim() || '—',
      image: productImage,
      price:
        review.product?.priceAfterDiscount ??
        review.product?.price ??
        null,
    },
  }
}

export function mapApiAverageRating(
  data: ApiAdminReviewsAverageRating,
): AdminReviewsAverageRating {
  return {
    value: Number(data.value) || 0,
    totalReviews: Number(data.totalReviews) || 0,
    breakdown: (data.breakdown ?? []).map((item) => ({
      star: item.star,
      count: item.count,
      percentage: item.percentage,
    })),
  }
}

export function mapApiRatingDistribution(
  data: ApiAdminReviewsRatingDistribution,
): AdminReviewsSentiment {
  return {
    positive: Number(data.positive) || 0,
    neutral: Number(data.neutral) || 0,
    negative: Number(data.negative) || 0,
    totalReviews: Number(data.totalReviews) || 0,
  }
}

export function mapApiFlaggedQueue(data: ApiAdminFlaggedQueue): AdminFlaggedQueue {
  return {
    count: Number(data.count) || 0,
    urgent: Number(data.urgent) || 0,
    items: (data.items ?? []).map((item) => ({
      id: String(item.id),
      reviewRef: item.reviewRef,
      snippet: item.snippet?.trim() || '—',
      updatedAt: item.updatedAt,
    })),
    pagination: data.pagination ?? null,
  }
}
