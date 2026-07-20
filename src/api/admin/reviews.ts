// src/api/admin/reviews.ts
import { apiRequest } from '../../lib/api'
import type {
  AdminReviewsListParams,
  ApiAdminReview,
  ApiAdminReviewDetail,
} from '../../types/adminReviews'

function toQuery(params: AdminReviewsListParams): string {
  const search = new URLSearchParams()
  const entries: Array<[string, string | number | undefined]> = [
    ['page', params.page],
    ['limit', params.limit],
    ['sort', params.sort],
    ['keyword', params.keyword],
    ['tab', params.tab],
  ]
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
  return apiRequest<ApiAdminReview[]>(`/reviews/admin${toQuery(params)}`, {
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
