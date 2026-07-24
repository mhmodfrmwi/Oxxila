// src/hooks/useAdminReviewsOverview.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getAdminFlaggedReviews,
  getAdminReviewsOverview,
} from '../api/admin/reviews'
import { ApiError } from '../lib/api'
import type {
  AdminFlaggedQueue,
  AdminReviewsAverageRating,
  AdminReviewsSentiment,
} from '../types/adminReviews'
import {
  mapApiAverageRating,
  mapApiFlaggedQueue,
  mapApiRatingDistribution,
} from '../utils/adminReviewsFormat'

const DEFAULT_QUEUE_LIMIT = 5

interface OverviewState {
  averageRating: AdminReviewsAverageRating | null
  sentiment: AdminReviewsSentiment | null
  flaggedQueue: AdminFlaggedQueue | null
  loading: boolean
  error: string | null
}

/** Reviews page top section — average rating + sentiment + flagged moderation queue. */
export function useAdminReviewsOverview() {
  const [state, setState] = useState<OverviewState>({
    averageRating: null,
    sentiment: null,
    flaggedQueue: null,
    loading: true,
    error: null,
  })
  const [queuePage, setQueuePage] = useState(1)
  const [queueLoading, setQueueLoading] = useState(false)
  const [queueError, setQueueError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [queueReloadToken, setQueueReloadToken] = useState(0)
  const requestIdRef = useRef(0)
  const queueRequestIdRef = useRef(0)
  const skipNextQueueFetchRef = useRef(true)

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const reloadFlaggedQueue = useCallback(() => {
    setQueueReloadToken((token) => token + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current
    skipNextQueueFetchRef.current = true

    async function load() {
      setState((previous) => ({ ...previous, loading: true, error: null }))
      try {
        const response = await getAdminReviewsOverview(
          { limit: 10, queuePage, queueLimit: DEFAULT_QUEUE_LIMIT },
          { signal: controller.signal },
        )
        if (requestId !== requestIdRef.current) return
        const data = response.data
        if (!data) {
          setState({
            averageRating: null,
            sentiment: null,
            flaggedQueue: null,
            loading: false,
            error: response.message || 'Reviews overview not found',
          })
          return
        }
        setState({
          averageRating: mapApiAverageRating(data.averageRating),
          sentiment: mapApiRatingDistribution(data.ratingDistribution),
          flaggedQueue: mapApiFlaggedQueue(data.flaggedQueue),
          loading: false,
          error: null,
        })
      } catch (error) {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return
        if (isAbortError(error)) return
        setState((previous) => ({
          ...previous,
          loading: false,
          error:
            error instanceof ApiError
              ? error.message
              : 'Unable to load reviews overview.',
        }))
      }
    }

    void load()
    return () => {
      controller.abort()
    }
    // Full-overview reload always re-fetches queue page 1 data too — queuePage is intentionally excluded here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadToken])

  useEffect(() => {
    if (skipNextQueueFetchRef.current) {
      skipNextQueueFetchRef.current = false
      return
    }

    const controller = new AbortController()
    const requestId = ++queueRequestIdRef.current

    async function loadQueue() {
      setQueueLoading(true)
      setQueueError(null)
      try {
        const response = await getAdminFlaggedReviews(
          { page: queuePage, limit: DEFAULT_QUEUE_LIMIT },
          { signal: controller.signal },
        )
        if (requestId !== queueRequestIdRef.current) return
        const data = response.data
        if (!data) {
          setQueueLoading(false)
          setQueueError(response.message || 'Flagged reviews not found')
          return
        }
        setState((previous) => ({
          ...previous,
          flaggedQueue: mapApiFlaggedQueue(data),
        }))
        setQueueLoading(false)
      } catch (error) {
        if (controller.signal.aborted || requestId !== queueRequestIdRef.current) return
        if (isAbortError(error)) return
        setQueueLoading(false)
        setQueueError(
          error instanceof ApiError
            ? error.message
            : 'Unable to load flagged reviews.',
        )
      }
    }

    void loadQueue()
    return () => {
      controller.abort()
    }
  }, [queuePage, queueReloadToken])

  return {
    averageRating: state.averageRating,
    sentiment: state.sentiment,
    flaggedQueue: state.flaggedQueue,
    loading: state.loading,
    error: state.error,
    queuePage,
    queueLoading,
    queueError,
    setQueuePage,
    reload,
    reloadFlaggedQueue,
  }
}
