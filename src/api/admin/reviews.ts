// src/api/admin/reviews.ts
import { apiRequest } from '../../lib/api'
import type {
  AdminFlaggedQueueParams,
  AdminReviewsListParams,
  AdminReviewsOverviewParams,
  ApiAdminFlaggedQueue,
  ApiAdminReview,
  ApiAdminReviewDetail,
  ApiAdminReviewMutationResult,
  ApiAdminReviewsOverview,
} from '../../types/adminReviews'

function toQuery(
  entries: ReadonlyArray<[string, string | number | undefined]>,
): string {
  const search = new URLSearchParams()
  for (const [key, value] of entries) {
    if (value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

/** GET /api/v1/reviews/admin — admin reviews list. */
export function getAdminReviews(
  params: AdminReviewsListParams = {},
  options?: { signal?: AbortSignal },
) {
  const query = toQuery([
    ['page', params.page],
    ['limit', params.limit],
    ['sort', params.sort],
    ['keyword', params.keyword],
    ['tab', params.tab],
  ])
  return apiRequest<ApiAdminReview[]>(`/reviews/admin${query}`, {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

/** GET /api/v1/reviews/admin/:id — admin review detail. */
export function getAdminReview(
  reviewId: string,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminReviewDetail>(
    `/reviews/admin/${encodeURIComponent(reviewId)}`,
    {
      method: 'GET',
      auth: true,
      signal: options?.signal,
    },
  )
}

/** GET /api/v1/reviews/admin/overview — average rating + sentiment + flagged queue + recent reviews. */
export function getAdminReviewsOverview(
  params: AdminReviewsOverviewParams = {},
  options?: { signal?: AbortSignal },
) {
  const query = toQuery([
    ['limit', params.limit],
    ['queuePage', params.queuePage],
    ['queueLimit', params.queueLimit],
  ])
  return apiRequest<ApiAdminReviewsOverview>(`/reviews/admin/overview${query}`, {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

/** GET /api/v1/reviews/admin/flagged — moderation queue only. */
export function getAdminFlaggedReviews(
  params: AdminFlaggedQueueParams = {},
  options?: { signal?: AbortSignal },
) {
  const query = toQuery([
    ['page', params.page],
    ['limit', params.limit],
  ])
  return apiRequest<ApiAdminFlaggedQueue>(`/reviews/admin/flagged${query}`, {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

/** PATCH /api/v1/reviews/:id/visibility — approve (true) / hide (false). */
export function updateAdminReviewVisibility(
  reviewId: string,
  isVisible: boolean,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminReviewMutationResult>(
    `/reviews/${encodeURIComponent(reviewId)}/visibility`,
    {
      method: 'PATCH',
      auth: true,
      body: { isVisible },
      signal: options?.signal,
    },
  )
}

/** PATCH /api/v1/reviews/:id/flag — flag (true) / unflag (false). */
export function updateAdminReviewFlag(
  reviewId: string,
  isFlagged: boolean,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminReviewMutationResult>(
    `/reviews/${encodeURIComponent(reviewId)}/flag`,
    {
      method: 'PATCH',
      auth: true,
      body: { isFlagged },
      signal: options?.signal,
    },
  )
}
