// src/hooks/useReviewDetailsDrawer.ts
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getAdminReview,
  updateAdminReviewFlag,
  updateAdminReviewVisibility,
} from '../api/admin/reviews'
import { ApiError } from '../lib/api'
import type { AdminReviewDetail } from '../types/adminReviews'
import { mapApiReviewToAdminDetail } from '../utils/adminReviewsFormat'

interface UseReviewDetailsDrawerOptions {
  open: boolean
  reviewId: string | null
  /** Notifies the caller after a successful visibility/flag mutation. */
  onReviewMutated?: (id: string, patch: { isVisible?: boolean; isFlagged?: boolean }) => void
}

interface ReviewDetailsState {
  review: AdminReviewDetail | null
  loading: boolean
  error: string | null
}

type MutationAction = 'approve' | 'hide' | 'flag' | 'unflag' | null

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

function mutationErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

export function useReviewDetailsDrawer({
  open,
  reviewId,
  onReviewMutated,
}: UseReviewDetailsDrawerOptions) {
  const [state, setState] = useState<ReviewDetailsState>({
    review: null,
    loading: false,
    error: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const [mutating, setMutating] = useState<MutationAction>(null)
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

  const setVisibility = useCallback(
    async (isVisible: boolean, fallbackError: string) => {
      if (!reviewId) return
      setMutating(isVisible ? 'approve' : 'hide')
      try {
        const response = await updateAdminReviewVisibility(reviewId, isVisible)
        const data = response.data
        setState((prev) =>
          prev.review
            ? {
                ...prev,
                review: {
                  ...prev.review,
                  isVisible: data?.isVisible ?? isVisible,
                  isFlagged: data?.isFlagged ?? prev.review.isFlagged,
                },
              }
            : prev,
        )
        onReviewMutated?.(reviewId, { isVisible: data?.isVisible ?? isVisible })
        setMutating(null)
        return { ok: true as const }
      } catch (error) {
        setMutating(null)
        return { ok: false as const, message: mutationErrorMessage(error, fallbackError) }
      }
    },
    [onReviewMutated, reviewId],
  )

  const setFlagged = useCallback(
    async (isFlagged: boolean, fallbackError: string) => {
      if (!reviewId) return
      setMutating(isFlagged ? 'flag' : 'unflag')
      try {
        const response = await updateAdminReviewFlag(reviewId, isFlagged)
        const data = response.data
        setState((prev) =>
          prev.review
            ? {
                ...prev,
                review: {
                  ...prev.review,
                  isFlagged: data?.isFlagged ?? isFlagged,
                  isVisible: data?.isVisible ?? prev.review.isVisible,
                },
              }
            : prev,
        )
        onReviewMutated?.(reviewId, { isFlagged: data?.isFlagged ?? isFlagged })
        setMutating(null)
        return { ok: true as const }
      } catch (error) {
        setMutating(null)
        return { ok: false as const, message: mutationErrorMessage(error, fallbackError) }
      }
    },
    [onReviewMutated, reviewId],
  )

  const approve = useCallback(
    (fallbackError: string) => setVisibility(true, fallbackError),
    [setVisibility],
  )
  const hide = useCallback(
    (fallbackError: string) => setVisibility(false, fallbackError),
    [setVisibility],
  )
  const flag = useCallback(
    (fallbackError: string) => setFlagged(true, fallbackError),
    [setFlagged],
  )
  const unflag = useCallback(
    (fallbackError: string) => setFlagged(false, fallbackError),
    [setFlagged],
  )

  return {
    review: state.review,
    loading: state.loading,
    error: state.error,
    mutating,
    reload,
    approve,
    hide,
    flag,
    unflag,
  }
}
