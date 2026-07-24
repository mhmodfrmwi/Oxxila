// src/components/admin/reviews/ReviewsCatalogTable.tsx
import { Eye, Flag } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { StarDisplay } from '../../product/reviews/StarDisplay'
import type { AdminReviewRow, AdminReviewsApiTab } from '../../../types/adminReviews'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import { DataTable, type DataTableColumn } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatusBadge'
import { ReviewsStatusTabs } from './ReviewsStatusTabs'

interface ReviewsCatalogTableProps {
  reviews: readonly AdminReviewRow[]
  loading?: boolean
  emptyTitle: string
  emptyDescription?: string
  emptyAction?: ReactNode
  showingCount: number
  totalCount: number
  currentPage: number
  totalPages: number
  statusTab: AdminReviewsApiTab
  onStatusTabChange: (tab: AdminReviewsApiTab) => void
  onPageChange: (page: number) => void
  onOpenReview?: (reviewId: string) => void
  onToggleVisibility?: (reviewId: string, isVisible: boolean) => void
  onToggleFlag?: (reviewId: string, isFlagged: boolean) => void
}

function ReviewerCell({
  name,
  avatar,
  initials,
  subtitle,
}: {
  name: string
  avatar: string | null
  initials: string
  subtitle: string
}) {
  return (
    <div className="flex min-w-[8rem] items-center gap-3">
      {avatar ? (
        <img
          src={avatar}
          alt=""
          className="size-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[rgba(163,148,255,0.2)] text-[8.8px] font-bold text-[#a394ff]"
          aria-hidden
        >
          {initials}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white" title={name}>
          {name}
        </p>
        <p className="truncate text-[8px] font-medium uppercase tracking-[0.08em] text-white/35">
          {subtitle}
        </p>
      </div>
    </div>
  )
}

/** Visibility toggle switch — PATCH /reviews/:id/visibility. */
function VisibilitySwitch({
  checked,
  label,
  onToggle,
}: {
  checked: boolean
  label: string
  onToggle?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors',
        checked
          ? 'border-support-success/40 bg-support-success'
          : 'border-white/15 bg-white/15',
        focusRingClasses,
      )}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
    >
      <span
        className={cn(
          'absolute top-0.5 start-0.5 size-4 rounded-full bg-white shadow transition-transform',
          checked && 'translate-x-4 rtl:-translate-x-4',
        )}
        aria-hidden
      />
    </button>
  )
}

export function ReviewsCatalogTable({
  reviews,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
  showingCount,
  totalCount,
  currentPage,
  totalPages,
  statusTab,
  onStatusTabChange,
  onPageChange,
  onOpenReview,
  onToggleVisibility,
  onToggleFlag,
}: ReviewsCatalogTableProps) {
  const { t } = useTranslation()

  const columns = useMemo<DataTableColumn<AdminReviewRow>[]>(
    () => [
      {
        id: 'patient',
        header: t('admin.reviews.columns.patient'),
        cell: (row) => (
          <ReviewerCell
            name={row.reviewerName}
            avatar={row.reviewerAvatar}
            initials={row.reviewerInitials}
            subtitle={row.reviewerOrdersLabel}
          />
        ),
      },
      {
        id: 'product',
        header: t('admin.reviews.columns.product'),
        cell: (row) => (
          <span className="text-sm text-white/80" title={row.productName}>
            {row.productName}
          </span>
        ),
      },
      {
        id: 'rating',
        header: t('admin.reviews.columns.rating'),
        cell: (row) => (
          <div
            className="flex items-center"
            aria-label={t('admin.reviews.ratingAria', { rating: row.rating })}
          >
            <StarDisplay rating={row.rating} size={11} />
          </div>
        ),
      },
      {
        id: 'feedback',
        header: t('admin.reviews.columns.feedback'),
        cell: (row) => (
          <p
            className="max-w-[12.8rem] truncate text-sm text-white/55"
            title={row.feedback}
          >
            {row.feedback}
          </p>
        ),
      },
      {
        id: 'status',
        header: t('admin.reviews.columns.status'),
        cell: (row) => (
          <div className="flex items-center gap-2">
            <VisibilitySwitch
              checked={row.isVisible}
              label={
                row.isVisible
                  ? t('admin.reviews.visibility.visible')
                  : t('admin.reviews.visibility.hidden')
              }
              onToggle={() => onToggleVisibility?.(row.id, !row.isVisible)}
            />
            {row.isFlagged ? (
              <StatusBadge tone="danger">
                {t('admin.reviews.flagged')}
              </StatusBadge>
            ) : null}
          </div>
        ),
      },
      {
        id: 'actions',
        header: t('admin.reviews.columns.actions'),
        headerClassName: 'text-end',
        className: 'text-end',
        cell: (row) => (
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => onOpenReview?.(row.id)}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-full',
                'border border-white/10 bg-white/5 text-white/70',
                'transition-colors hover:bg-white/10 hover:text-white',
                focusRingClasses,
              )}
              aria-label={t('admin.reviews.viewAria', { id: row.id })}
            >
              <Eye size={11} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => onToggleFlag?.(row.id, !row.isFlagged)}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-full border transition-colors',
                row.isFlagged
                  ? 'border-support-error/30 bg-support-error/10 text-support-error hover:bg-support-error/20'
                  : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white',
                focusRingClasses,
              )}
              aria-label={
                row.isFlagged
                  ? t('admin.reviews.unflagAria', { id: row.id })
                  : t('admin.reviews.flagAria', { id: row.id })
              }
              title={
                row.isFlagged
                  ? t('admin.reviews.details.unflag')
                  : t('admin.reviews.details.flag')
              }
            >
              <Flag size={11} aria-hidden fill={row.isFlagged ? 'currentColor' : 'none'} />
            </button>
          </div>
        ),
      },
    ],
    [onOpenReview, onToggleFlag, onToggleVisibility, t],
  )

  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages && totalPages > 1

  return (
    <DataTable
      columns={columns}
      rows={reviews}
      getRowId={(row) => row.id}
      loading={loading}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyAction={emptyAction}
      aria-label={t('admin.reviews.tableAria')}
      className="rounded-[1.6rem]"
      toolbar={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-bold text-white">
            {t('admin.reviews.tableTitle')}
          </h3>
          <ReviewsStatusTabs
            active={statusTab}
            onChange={onStatusTabChange}
            disabled={loading && reviews.length === 0}
          />
        </div>
      }
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="text-[8px] font-bold uppercase tracking-[0.08em] text-white/30"
            aria-live="polite"
          >
            {t('admin.reviews.showing', {
              showing: showingCount,
              total: totalCount,
            })}
          </p>
          <div
            className="flex items-center gap-2"
            role="group"
            aria-label={t('admin.reviews.paginationAria')}
          >
            <button
              type="button"
              disabled={!canGoPrev || loading}
              onClick={() => onPageChange(currentPage - 1)}
              className={cn(
                'rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/50',
                'transition-colors hover:bg-white/10 hover:text-white/80',
                'disabled:cursor-not-allowed disabled:opacity-40',
                focusRingClasses,
              )}
            >
              {t('admin.reviews.prev')}
            </button>
            <button
              type="button"
              disabled={!canGoNext || loading}
              onClick={() => onPageChange(currentPage + 1)}
              className={cn(
                'rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white',
                'transition-opacity hover:opacity-95',
                'disabled:cursor-not-allowed disabled:opacity-40',
                focusRingClasses,
              )}
            >
              {t('admin.reviews.next')}
            </button>
          </div>
        </div>
      }
    />
  )
}
