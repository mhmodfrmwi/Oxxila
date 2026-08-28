// src/pages/admin/AdminReviewsPage.tsx
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { ReviewDetailsDrawer } from '../../components/admin/reviews/ReviewDetailsDrawer'
import { ReviewsAverageRatingCard } from '../../components/admin/reviews/ReviewsAverageRatingCard'
import { ReviewsCatalogTable } from '../../components/admin/reviews/ReviewsCatalogTable'
import { ReviewsFlaggedQueueCard } from '../../components/admin/reviews/ReviewsFlaggedQueueCard'
import { ReviewsListToolbar } from '../../components/admin/reviews/ReviewsListToolbar'
import { ReviewsSentimentCard } from '../../components/admin/reviews/ReviewsSentimentCard'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { useAdminReviews } from '../../hooks/useAdminReviews'
import { useAdminReviewsOverview } from '../../hooks/useAdminReviewsOverview'
import { useAdminUrlOpen } from '../../hooks/useAdminUrlOpen'

/**
 * Reviews & Reputation — overview widgets + list + details drawer.
 * Contract: FRONTEND_ADMIN_DASHBOARD.md §5 (isFlagged only, no resolve/moderationStatus).
 */
export function AdminReviewsPage() {
  const { t } = useTranslation()
  const list = useAdminReviews()
  const overview = useAdminReviewsOverview()
  const [drawerReviewId, setDrawerReviewId] = useState<string | null>(null)

  const openDrawer = useCallback((reviewId: string) => {
    setDrawerReviewId(reviewId)
  }, [])

  useAdminUrlOpen(openDrawer)

  const closeDrawer = useCallback(() => {
    setDrawerReviewId(null)
  }, [])

  const handleToggleVisibility = useCallback(
    (reviewId: string, isVisible: boolean) => {
      void list.patchVisibility(reviewId, isVisible)
    },
    [list],
  )

  const handleToggleFlag = useCallback(
    (reviewId: string, isFlagged: boolean) => {
      void list.patchFlag(reviewId, isFlagged)
      overview.reloadFlaggedQueue()
    },
    [list, overview],
  )

  const handleReviewMutatedInDrawer = useCallback(
    (reviewId: string, patch: { isVisible?: boolean; isFlagged?: boolean }) => {
      list.updateReviewLocally(reviewId, patch)
      if (patch.isFlagged !== undefined) {
        overview.reloadFlaggedQueue()
      }
    },
    [list, overview],
  )

  const failed = Boolean(list.error) && !list.loading && list.reviews.length === 0
  const staleError = Boolean(list.error) && list.reviews.length > 0
  const currentPage = list.pagination?.currentPage ?? list.filters.page
  const totalPages = Math.max(list.pagination?.numberOfPages ?? 1, 1)
  const totalCount = list.pagination?.totalDocuments ?? list.reviews.length
  const showingCount = list.reviews.length

  const emptyTitle = list.hasActiveFilters
    ? t('admin.reviews.emptyFilteredTitle')
    : t('admin.reviews.emptyTitle')
  const emptyDescription = list.hasActiveFilters
    ? t('admin.reviews.emptyFilteredDescription')
    : t('admin.reviews.emptyDescription')

  return (
    <>
      <AdminPageHeader
        title={t('admin.reviews.title')}
        subtitle={t('admin.reviews.subtitle')}
        actions={
          <ReviewsListToolbar
            keyword={list.filters.keyword}
            onKeywordChange={list.setKeyword}
            disabled={list.loading && list.reviews.length === 0}
          />
        }
      />

      <div className="flex w-full flex-col gap-[var(--admin-content-gap-tight)] lg:flex-row lg:items-stretch">
        <ReviewsAverageRatingCard
          data={overview.averageRating}
          loading={overview.loading}
        />
        <ReviewsSentimentCard data={overview.sentiment} loading={overview.loading} />
        <ReviewsFlaggedQueueCard
          data={overview.flaggedQueue}
          loading={overview.loading}
          queueLoading={overview.queueLoading}
          onPageChange={overview.setQueuePage}
          onOpenReview={openDrawer}
        />
      </div>

      {failed ? (
        <EmptyState
          title={t('admin.reviews.loadErrorTitle')}
          description={list.error ?? t('admin.reviews.loadErrorDescription')}
          action={
            <Button type="button" variant="outline" onClick={list.reload}>
              {t('admin.reviews.retry')}
            </Button>
          }
        />
      ) : (
        <>
          {staleError ? (
            <p
              className="rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
              role="alert"
            >
              {list.error}
            </p>
          ) : null}

          <ReviewsCatalogTable
            reviews={list.reviews}
            loading={list.loading}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            emptyAction={
              list.hasActiveFilters ? (
                <Button type="button" variant="outline" onClick={list.clearFilters}>
                  {t('admin.reviews.clearFilters')}
                </Button>
              ) : undefined
            }
            showingCount={showingCount}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            statusTab={list.filters.statusTab}
            onStatusTabChange={list.setStatusTab}
            onPageChange={list.setPage}
            onOpenReview={openDrawer}
            onToggleVisibility={handleToggleVisibility}
            onToggleFlag={handleToggleFlag}
          />
        </>
      )}

      <ReviewDetailsDrawer
        open={Boolean(drawerReviewId)}
        reviewId={drawerReviewId}
        onClose={closeDrawer}
        onReviewMutated={handleReviewMutatedInDrawer}
      />
    </>
  )
}
