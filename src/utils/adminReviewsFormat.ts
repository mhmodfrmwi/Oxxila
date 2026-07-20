// src/utils/adminReviewsFormat.ts
import type { StatusBadgeTone } from '../components/admin/ui/StatusBadge'
import type {
  AdminReviewDetail,
  AdminReviewModerationStatus,
  AdminReviewRow,
  AdminReviewsApiTab,
  AdminReviewsStatusTab,
  ApiAdminReview,
  ApiAdminReviewDetail,
} from '../types/adminReviews'
import {
  formatDashboardDate,
  formatDashboardMoney,
  resolveDashboardLocale,
} from './adminDashboardFormat'
import { customerInitials } from './adminOrdersFormat'

export function formatReviewDate(value: string, locale = 'en'): string {
  return formatDashboardDate(value, locale)
}

export function formatCount(value: number, locale = 'en'): string {
  return new Intl.NumberFormat(resolveDashboardLocale(locale)).format(value)
}

/** Map Figma pills onto backend `tab` query values. */
export function statusTabToApiTab(tab: AdminReviewsStatusTab): AdminReviewsApiTab {
  switch (tab) {
    case 'pending':
      return 'hidden'
    case 'approved':
      return 'visible'
    case 'reported':
      return 'flagged'
    default:
      return 'all'
  }
}

export function reviewModerationBadgeTone(
  status: AdminReviewModerationStatus,
): StatusBadgeTone {
  switch (status) {
    case 'flagged':
      return 'danger'
    case 'resolved':
      return 'info'
    default:
      return 'neutral'
  }
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
    moderationStatus: review.moderationStatus ?? 'none',
    moderationBadge: review.moderationBadge ?? null,
    createdAt: review.createdAt,
  }
}

export function formatReviewMoney(value: number, locale = 'en'): string {
  return formatDashboardMoney(value, locale)
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
    moderationStatus: review.moderationStatus ?? 'none',
    moderationBadge: review.moderationBadge ?? null,
    flagReason: review.flagReason ?? null,
    flaggedAt: review.flaggedAt ?? null,
    flaggedByName: review.flaggedBy?.name?.trim() || null,
    resolvedAt: review.resolvedAt ?? null,
    resolvedByName: review.resolvedBy?.name?.trim() || null,
    resolvedNote: review.resolvedNote?.trim() || null,
    createdAt: review.createdAt,
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

export function hasReviewModerationDetails(review: AdminReviewDetail): boolean {
  return (
    review.moderationStatus === 'flagged' ||
    review.moderationStatus === 'resolved' ||
    Boolean(review.flagReason) ||
    Boolean(review.resolvedNote)
  )
}
