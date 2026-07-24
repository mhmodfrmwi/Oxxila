// src/components/admin/reviews/ReviewDetailsDrawer.tsx
import { EyeOff, Flag, ThumbsUp } from 'lucide-react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useReviewDetailsDrawer } from '../../../hooks/useReviewDetailsDrawer'
import { useToast } from '../../../context/ToastContext'
import { cn } from '../../../lib/cn'
import { StarDisplay } from '../../product/reviews/StarDisplay'
import { formatReviewDate, formatReviewMoney } from '../../../utils/adminReviewsFormat'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Drawer } from '../ui/Drawer'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'
import { StatusBadge } from '../ui/StatusBadge'

interface ReviewDetailsDrawerProps {
  open: boolean
  reviewId: string | null
  onClose: () => void
  /** Notifies the Reviews list/overview to reflect the same isVisible/isFlagged change. */
  onReviewMutated?: (id: string, patch: { isVisible?: boolean; isFlagged?: boolean }) => void
}

function ReviewDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <GlassCard className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5" padding="none">
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
      </GlassCard>
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[8px] uppercase leading-[12px] tracking-[0.1em] text-white/30">
        {label}
      </p>
      <p className="truncate text-sm font-medium leading-5 text-white" title={value}>
        {value}
      </p>
    </div>
  )
}

export function ReviewDetailsDrawer({
  open,
  reviewId,
  onClose,
  onReviewMutated,
}: ReviewDetailsDrawerProps) {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const locale = i18n.language
  const { review, loading, error, reload, mutating, approve, hide, flag, unflag } =
    useReviewDetailsDrawer({ open, reviewId, onReviewMutated })
  const unavailable = '—'

  const visibilityLabel = review
    ? review.isVisible
      ? t('admin.reviews.visibility.visible')
      : t('admin.reviews.visibility.hidden')
    : null

  const handleApprove = useCallback(async () => {
    const result = await approve(t('admin.reviews.details.actionError'))
    if (!result) return
    if (result.ok) {
      toast.success(t('admin.reviews.details.approveSuccess'))
    } else {
      toast.error(result.message)
    }
  }, [approve, t, toast])

  const handleHide = useCallback(async () => {
    const result = await hide(t('admin.reviews.details.actionError'))
    if (!result) return
    if (result.ok) {
      toast.success(t('admin.reviews.details.hideSuccess'))
    } else {
      toast.error(result.message)
    }
  }, [hide, t, toast])

  const handleFlag = useCallback(async () => {
    const result = await flag(t('admin.reviews.details.actionError'))
    if (!result) return
    if (result.ok) {
      toast.success(t('admin.reviews.details.flagSuccess'))
    } else {
      toast.error(result.message)
    }
  }, [flag, t, toast])

  const handleUnflag = useCallback(async () => {
    const result = await unflag(t('admin.reviews.details.actionError'))
    if (!result) return
    if (result.ok) {
      toast.success(t('admin.reviews.details.unflagSuccess'))
    } else {
      toast.error(result.message)
    }
  }, [unflag, t, toast])

  const busy = mutating !== null

  const footer =
    review && !loading && !error ? (
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <button
            type="button"
            disabled={busy || review.isVisible}
            onClick={handleApprove}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3',
              'text-sm font-medium text-white',
              'transition-colors hover:bg-white/10',
              'disabled:cursor-not-allowed disabled:opacity-50',
              focusRingClasses,
            )}
          >
            <ThumbsUp size={13} aria-hidden />
            {t('admin.reviews.details.approve')}
          </button>
          <button
            type="button"
            disabled={busy || !review.isVisible}
            onClick={handleHide}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3',
              'text-sm font-medium text-white',
              'transition-colors hover:bg-white/10',
              'disabled:cursor-not-allowed disabled:opacity-50',
              focusRingClasses,
            )}
          >
            <EyeOff size={13} aria-hidden />
            {t('admin.reviews.details.hide')}
          </button>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={review.isFlagged ? handleUnflag : handleFlag}
          className={cn(
            'inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3',
            'text-sm font-medium',
            'transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            review.isFlagged
              ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
              : 'border-[rgba(255,100,103,0.2)] bg-[rgba(255,100,103,0.1)] text-[#ff6467] hover:bg-[rgba(255,100,103,0.18)]',
            focusRingClasses,
          )}
        >
          <Flag size={13} aria-hidden fill={review.isFlagged ? 'currentColor' : 'none'} />
          {review.isFlagged
            ? t('admin.reviews.details.unflag')
            : t('admin.reviews.details.flag')}
        </button>
      </div>
    ) : undefined

  return (
    <Drawer
      open={open}
      title={t('admin.reviews.details.title')}
      description={t('admin.reviews.details.subtitle')}
      onClose={onClose}
      width="order"
      footer={footer}
    >
      {loading && !review ? <ReviewDetailsSkeleton /> : null}

      {!loading && error ? (
        <EmptyState
          bare
          title={t('admin.reviews.details.loadErrorTitle')}
          description={error}
          action={
            <Button type="button" variant="outline" onClick={reload}>
              {t('admin.reviews.retry')}
            </Button>
          }
        />
      ) : null}

      {!loading && !error && !review ? (
        <EmptyState
          bare
          title={t('admin.reviews.details.emptyTitle')}
          description={t('admin.reviews.details.emptyDescription')}
        />
      ) : null}

      {review && !error ? (
        <div className={cn('flex flex-col gap-8', loading && 'opacity-60')}>
          <section aria-labelledby="review-reviewer-heading">
            <h3
              id="review-reviewer-heading"
              className="mb-3 text-sm font-bold leading-5 text-white"
            >
              {t('admin.reviews.details.reviewer')}
            </h3>
            <GlassCard
              className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5"
              padding="none"
            >
              <div className="flex items-center gap-4">
                {review.reviewer.avatar ? (
                  <img
                    src={review.reviewer.avatar}
                    alt=""
                    className="size-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-[rgba(163,148,255,0.2)] text-sm font-bold text-[#a394ff]"
                    aria-hidden
                  >
                    {review.reviewer.initials}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-white">
                    {review.reviewer.name}
                  </p>
                  <p className="truncate text-xs text-white/40">
                    {t('admin.reviews.ordersCount', {
                      count: review.reviewer.totalOrders,
                    })}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailField
                  label={t('admin.reviews.details.email')}
                  value={review.reviewer.email ?? unavailable}
                />
                <DetailField
                  label={t('admin.reviews.details.phone')}
                  value={review.reviewer.phone ?? unavailable}
                />
              </div>
            </GlassCard>
          </section>

          <section aria-labelledby="review-product-heading">
            <h3
              id="review-product-heading"
              className="mb-3 text-sm font-bold leading-5 text-white"
            >
              {t('admin.reviews.details.product')}
            </h3>
            <GlassCard
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
              padding="none"
            >
              <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-white/10 p-1">
                {review.product.image ? (
                  <img
                    src={review.product.image}
                    alt=""
                    className="size-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="size-full rounded-lg bg-white/5" aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {review.product.name}
                </p>
                <p className="text-xs text-white/40">
                  {review.product.price == null
                    ? unavailable
                    : formatReviewMoney(review.product.price, locale)}
                </p>
              </div>
            </GlassCard>
          </section>

          <section aria-labelledby="review-content-heading">
            <h3
              id="review-content-heading"
              className="mb-3 text-sm font-bold leading-5 text-white"
            >
              {t('admin.reviews.details.fullReview')}
            </h3>
            <GlassCard
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5"
              padding="none"
            >
              <div
                className="flex items-center gap-2"
                aria-label={t('admin.reviews.ratingAria', { rating: review.rating })}
              >
                <StarDisplay rating={review.rating} size={13} />
                <span className="text-sm font-medium text-white/70">
                  {review.rating}/5
                </span>
              </div>
              {review.title ? (
                <p className="text-sm font-semibold text-white">{review.title}</p>
              ) : null}
              <p className="whitespace-pre-wrap text-sm leading-6 text-white/70">
                {review.comment}
              </p>
            </GlassCard>
          </section>

          <section aria-labelledby="review-meta-heading">
            <h3
              id="review-meta-heading"
              className="mb-3 text-sm font-bold leading-5 text-white"
            >
              {t('admin.reviews.details.meta')}
            </h3>
            <GlassCard
              className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-2"
              padding="none"
            >
              <DetailField
                label={t('admin.reviews.details.date')}
                value={
                  review.createdAt
                    ? formatReviewDate(review.createdAt, locale)
                    : unavailable
                }
              />
              <div className="min-w-0">
                <p className="text-[8px] uppercase leading-[12px] tracking-[0.1em] text-white/30">
                  {t('admin.reviews.details.status')}
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <StatusBadge tone={review.isVisible ? 'success' : 'neutral'}>
                    {visibilityLabel}
                  </StatusBadge>
                  {review.isFlagged ? (
                    <StatusBadge tone="danger">
                      {t('admin.reviews.flagged')}
                    </StatusBadge>
                  ) : null}
                </div>
              </div>
            </GlassCard>
          </section>
        </div>
      ) : null}
    </Drawer>
  )
}
