// src/hooks/useProductInteractions.ts
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  askSpecialist,
  createProductReview,
  deleteReview,
  toggleReviewLike,
} from '../api/catalog'
import { LOGIN_PATH } from '../config/routes'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../lib/api'
import type { WriteReviewFormValues } from '../components/product/WriteReviewDialog'

interface UseProductInteractionsOptions {
  productId: string | undefined
  refreshReviews: () => Promise<void>
  onReviewLikeUpdated?: (reviewId: string, likesCount: number, liked: boolean) => void
}

function resolveErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message.trim()) return error.message
  return fallback
}

export function useProductInteractions({
  productId,
  refreshReviews,
  onReviewLikeUpdated,
}: UseProductInteractionsOptions) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const toast = useToast()

  const [askOpen, setAskOpen] = useState(false)
  const [askSubmitting, setAskSubmitting] = useState(false)
  const [askError, setAskError] = useState<string | null>(null)

  const [writeOpen, setWriteOpen] = useState(false)
  const [writeSubmitting, setWriteSubmitting] = useState(false)
  const [writeError, setWriteError] = useState<string | null>(null)

  const [pendingReviewId, setPendingReviewId] = useState<string | null>(null)

  const requireAuth = useCallback(() => {
    if (isAuthenticated) return true
    toast.error(t('productDetail.auth.signInRequired'), t('productDetail.auth.signInRequiredDetail'))
    navigate(LOGIN_PATH)
    return false
  }, [isAuthenticated, navigate, t, toast])

  const openAskSpecialist = useCallback(() => {
    if (!requireAuth()) return
    setAskError(null)
    setAskOpen(true)
  }, [requireAuth])

  const openWriteReview = useCallback(() => {
    if (!requireAuth()) return
    setWriteError(null)
    setWriteOpen(true)
  }, [requireAuth])

  const closeAskSpecialist = useCallback(() => {
    if (askSubmitting) return
    setAskOpen(false)
    setAskError(null)
  }, [askSubmitting])

  const closeWriteReview = useCallback(() => {
    if (writeSubmitting) return
    setWriteOpen(false)
    setWriteError(null)
  }, [writeSubmitting])

  const submitAskSpecialist = useCallback(
    async (question: string) => {
      if (!productId || askSubmitting) return false
      if (!requireAuth()) return false

      setAskSubmitting(true)
      setAskError(null)

      try {
        const response = await askSpecialist(productId, question)
        toast.success(
          response.message || t('productDetail.questions.askForm.success'),
        )
        setAskOpen(false)
        return true
      } catch (error) {
        const message = resolveErrorMessage(
          error,
          t('productDetail.questions.askForm.failed'),
        )
        setAskError(message)
        if (error instanceof ApiError && error.statusCode === 401) {
          navigate(LOGIN_PATH)
        }
        return false
      } finally {
        setAskSubmitting(false)
      }
    },
    [askSubmitting, navigate, productId, requireAuth, t, toast],
  )

  const submitWriteReview = useCallback(
    async (values: WriteReviewFormValues) => {
      if (!productId || writeSubmitting) return false
      if (!requireAuth()) return false

      setWriteSubmitting(true)
      setWriteError(null)

      try {
        const response = await createProductReview(productId, values)
        toast.success(
          response.message || t('productDetail.reviews.writeForm.success'),
        )
        setWriteOpen(false)
        await refreshReviews()
        return true
      } catch (error) {
        const message = resolveErrorMessage(
          error,
          t('productDetail.reviews.writeForm.failed'),
        )
        setWriteError(message)
        if (error instanceof ApiError && error.statusCode === 401) {
          navigate(LOGIN_PATH)
        }
        return false
      } finally {
        setWriteSubmitting(false)
      }
    },
    [navigate, productId, refreshReviews, requireAuth, t, toast, writeSubmitting],
  )

  const toggleHelpful = useCallback(
    async (reviewId: string) => {
      if (!reviewId || pendingReviewId) return
      if (!requireAuth()) return

      setPendingReviewId(reviewId)
      try {
        const response = await toggleReviewLike(reviewId)
        const likesCount = response.data?.likesCount ?? 0
        const liked = Boolean(response.data?.liked)
        onReviewLikeUpdated?.(reviewId, likesCount, liked)
      } catch (error) {
        toast.error(
          resolveErrorMessage(error, t('productDetail.reviews.helpfulFailed')),
        )
        if (error instanceof ApiError && error.statusCode === 401) {
          navigate(LOGIN_PATH)
        }
      } finally {
        setPendingReviewId(null)
      }
    },
    [navigate, onReviewLikeUpdated, pendingReviewId, requireAuth, t, toast],
  )

  const removeReview = useCallback(
    async (reviewId: string) => {
      if (!reviewId || pendingReviewId) return
      if (!requireAuth()) return

      setPendingReviewId(reviewId)
      try {
        const response = await deleteReview(reviewId)
        toast.success(
          response.message || t('productDetail.reviews.deleteSuccess'),
        )
        await refreshReviews()
      } catch (error) {
        toast.error(
          resolveErrorMessage(error, t('productDetail.reviews.deleteFailed')),
        )
        if (error instanceof ApiError && error.statusCode === 401) {
          navigate(LOGIN_PATH)
        }
      } finally {
        setPendingReviewId(null)
      }
    },
    [navigate, pendingReviewId, refreshReviews, requireAuth, t, toast],
  )

  return {
    askOpen,
    askSubmitting,
    askError,
    openAskSpecialist,
    closeAskSpecialist,
    submitAskSpecialist,
    writeOpen,
    writeSubmitting,
    writeError,
    openWriteReview,
    closeWriteReview,
    submitWriteReview,
    pendingReviewId,
    toggleHelpful,
    removeReview,
  }
}
