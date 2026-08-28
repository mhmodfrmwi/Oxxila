// src/pages/admin/AdminActivityLogPage.tsx
import { useTranslation } from 'react-i18next'
import { ActivityLogTable } from '../../components/admin/activity/ActivityLogTable'
import { ActivityLogToolbar } from '../../components/admin/activity/ActivityLogToolbar'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { RequireSuperAdmin } from '../../components/admin/RequireSuperAdmin'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { useAdminActivityLogs } from '../../hooks/useAdminActivityLogs'

/**
 * Super Admin activity feed — searchable audit log across all admin mutations.
 */
export function AdminActivityLogPage() {
  const { t } = useTranslation()
  const list = useAdminActivityLogs()

  const failed = Boolean(list.error) && !list.loading && list.logs.length === 0
  const staleError = Boolean(list.error) && list.logs.length > 0
  const currentPage = list.pagination?.currentPage ?? list.filters.page
  const totalPages = Math.max(list.pagination?.numberOfPages ?? 1, 1)
  const totalCount = list.pagination?.totalDocuments ?? list.logs.length
  const showingCount = list.logs.length

  const emptyTitle = list.hasActiveFilters
    ? t('admin.audit.emptyFilteredTitle')
    : t('admin.audit.emptyTitle')
  const emptyDescription = list.hasActiveFilters
    ? t('admin.audit.emptyFilteredDescription')
    : t('admin.audit.emptyDescription')

  return (
    <RequireSuperAdmin>
      <AdminPageHeader
        title={t('admin.audit.pageTitle')}
        subtitle={t('admin.audit.pageSubtitle')}
      />

      <ActivityLogToolbar
        keyword={list.filters.keyword}
        actor={list.filters.actor}
        tab={list.filters.tab}
        action={list.filters.action}
        resourceType={list.filters.resourceType}
        dateFrom={list.filters.dateFrom}
        dateTo={list.filters.dateTo}
        onKeywordChange={list.setKeyword}
        onActorChange={list.setActor}
        onTabChange={list.setTab}
        onActionChange={list.setAction}
        onResourceTypeChange={list.setResourceType}
        onDateFromChange={list.setDateFrom}
        onDateToChange={list.setDateTo}
        disabled={list.loading && list.logs.length === 0}
      />

      {failed ? (
        <EmptyState
          title={t('admin.audit.loadErrorTitle')}
          description={list.error ?? t('admin.audit.loadErrorDescription')}
          action={
            <Button type="button" variant="outline" onClick={list.reload}>
              {t('admin.audit.retry')}
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

          <ActivityLogTable
            logs={list.logs}
            loading={list.loading}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            emptyAction={
              list.hasActiveFilters ? (
                <Button type="button" variant="outline" onClick={list.clearFilters}>
                  {t('admin.audit.clearFilters')}
                </Button>
              ) : undefined
            }
            showingCount={showingCount}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={list.setPage}
          />
        </>
      )}
    </RequireSuperAdmin>
  )
}
