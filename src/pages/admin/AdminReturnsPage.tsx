// src/pages/admin/AdminReturnsPage.tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { ReturnDetailsPanel } from '../../components/admin/returns/ReturnDetailsPanel'
import { ReturnsCatalogTable } from '../../components/admin/returns/ReturnsCatalogTable'
import { ReturnsStatusTabs } from '../../components/admin/returns/ReturnsStatusTabs'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { useAdminReturns } from '../../hooks/useAdminReturns'

/**
 * Returns Management — list + split detail panel (Milestone 1), with approve/reject
 * and logistics actions (Milestone 2). Refund-to-`refunded` and orders deep-link UI
 * land in Milestone 3.
 */
export function AdminReturnsPage() {
  const { t } = useTranslation()
  const list = useAdminReturns()
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null)

  const failed = Boolean(list.error) && !list.loading && list.returns.length === 0
  const staleError = Boolean(list.error) && list.returns.length > 0
  const currentPage = list.pagination?.currentPage ?? list.filters.page
  const totalPages = Math.max(list.pagination?.numberOfPages ?? 1, 1)
  const totalCount = list.pagination?.totalDocuments ?? list.returns.length
  const showingCount = list.returns.length

  const emptyTitle = list.hasActiveFilters
    ? t('admin.returns.emptyFilteredTitle')
    : t('admin.returns.emptyTitle')
  const emptyDescription = list.hasActiveFilters
    ? t('admin.returns.emptyFilteredDescription')
    : t('admin.returns.emptyDescription')

  return (
    <>
      <AdminPageHeader
        title={t('admin.returns.title')}
        subtitle={t('admin.returns.subtitle')}
      />

      <ReturnsStatusTabs
        active={list.filters.statusTab}
        activeCount={totalCount}
        onChange={list.setStatusTab}
        disabled={list.loading && list.returns.length === 0}
      />

      {failed ? (
        <EmptyState
          title={t('admin.returns.loadErrorTitle')}
          description={list.error ?? t('admin.returns.loadErrorDescription')}
          action={
            <Button type="button" variant="outline" onClick={list.reload}>
              {t('admin.returns.retry')}
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

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <ReturnsCatalogTable
              returns={list.returns}
              loading={list.loading}
              emptyTitle={emptyTitle}
              emptyDescription={emptyDescription}
              emptyAction={
                list.hasActiveFilters ? (
                  <Button type="button" variant="outline" onClick={list.clearFilters}>
                    {t('admin.returns.clearFilters')}
                  </Button>
                ) : undefined
              }
              showingCount={showingCount}
              totalCount={totalCount}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={list.setPage}
              selectedReturnId={selectedReturnId}
              onSelectReturn={setSelectedReturnId}
            />

            <ReturnDetailsPanel
              returnId={selectedReturnId}
              className="xl:sticky xl:top-6"
              onMutated={list.reload}
            />
          </div>
        </>
      )}
    </>
  )
}
