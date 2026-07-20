// src/hooks/useReviewDetailsDrawer.ts
import { useCallback, useEffect, useRef, useState } from 'react'
import { getAdminReview } from '../api/admin/reviews'
import { ApiError } from '../lib/api'
import type { AdminReviewDetail } from '../types/adminReviews'
import { mapApiReviewToAdminDetail } from '../utils/adminReviewsFormat'

interface UseReviewDetailsDrawerOptions {
  open: boolean
  reviewId: string | null
}

interface ReviewDetailsState {
  review: AdminReviewDetail | null
  loading: boolean
  error: string | null
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

export function useReviewDetailsDrawer({
  open,
  reviewId,
}: UseReviewDetailsDrawerOptions) {
  const [state, setState] = useState<ReviewDetailsState>({
    review: null,
    loading: false,
    error: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  useEffect(() => {
    if (!open || !reviewId) {
      setState({ review: null, loading: false, error: null })
      return
    }

    const requestId = ++requestIdRef.current
    const controller = new AbortController()

    setState((prev) => ({
      review: prev.review?.id === reviewId ? prev.review : null,
      loading: true,
      error: null,
    }))

    void (async () => {
      try {
        const response = await getAdminReview(reviewId, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return
        const data = response.data
        if (!data) {
          setState({
            review: null,
            loading: false,
            error: response.message || 'Review not found',
          })
          return
        }
        setState({
          review: mapApiReviewToAdminDetail(data),
          loading: false,
          error: null,
        })
      } catch (error) {
        if (isAbortError(error) || requestId !== requestIdRef.current) return
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Unable to load review'
        setState({ review: null, loading: false, error: message })
      }
    })()

    return () => {
      controller.abort()
    }
  }, [open, reviewId, reloadToken])

  return {
    review: state.review,
    loading: state.loading,
    error: state.error,
    reload,
  }
}
