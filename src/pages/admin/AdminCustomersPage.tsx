// src/pages/admin/AdminCustomersPage.tsx
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { CustomerDetailsDrawer } from '../../components/admin/customers/CustomerDetailsDrawer'
import { CustomersCatalogTable } from '../../components/admin/customers/CustomersCatalogTable'
import { CustomersListToolbar } from '../../components/admin/customers/CustomersListToolbar'
import { CustomersSegmentTabs } from '../../components/admin/customers/CustomersSegmentTabs'
import { CustomersStatsRow } from '../../components/admin/customers/CustomersStatsRow'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { useAdminCustomers } from '../../hooks/useAdminCustomers'

/**
 * Customer Intelligence — list + read-only details drawer (Phase 4A/4B).
 * Figma: Customers `937:18907` / Patient Intelligence drawer `941:44197`.
 */
export function AdminCustomersPage() {
  const { t } = useTranslation()
  const list = useAdminCustomers()
  const [drawerCustomerId, setDrawerCustomerId] = useState<string | null>(null)

  const openDrawer = useCallback((customerId: string) => {
    setDrawerCustomerId(customerId)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerCustomerId(null)
  }, [])

  const failed =
    Boolean(list.error) && !list.loading && list.customers.length === 0
  const staleError = Boolean(list.error) && list.customers.length > 0
  const currentPage = list.pagination?.currentPage ?? list.filters.page
  const totalPages = Math.max(list.pagination?.numberOfPages ?? 1, 1)
  const totalCount = list.pagination?.totalDocuments ?? list.customers.length
  const showingCount = list.customers.length

  const emptyTitle = list.segmentUnsupported
    ? t('admin.customers.segmentUnavailableTitle')
    : list.hasActiveFilters
      ? t('admin.customers.emptyFilteredTitle')
      : t('admin.customers.emptyTitle')
  const emptyDescription = list.segmentUnsupported
    ? t('admin.customers.segmentUnavailableDescription')
    : list.hasActiveFilters
      ? t('admin.customers.emptyFilteredDescription')
      : t('admin.customers.emptyDescription')

  return (
    <>
      <AdminPageHeader
        title={t('admin.customers.title')}
        subtitle={t('admin.customers.subtitle')}
        actions={
          <CustomersListToolbar
            keyword={list.filters.keyword}
            onKeywordChange={list.setKeyword}
            disabled={list.loading && list.customers.length === 0}
          />
        }
      />

      <CustomersStatsRow
        totalCustomers={list.pagination?.totalDocuments ?? null}
        loading={list.loading && list.customers.length === 0}
      />

      <CustomersSegmentTabs
        active={list.filters.segmentTab}
        activeCount={totalCount}
        onChange={list.setSegmentTab}
        disabled={list.loading && list.customers.length === 0}
      />

      {failed ? (
        <EmptyState
          title={t('admin.customers.loadErrorTitle')}
          description={list.error ?? t('admin.customers.loadErrorDescription')}
          action={
            <Button type="button" variant="outline" onClick={list.reload}>
              {t('admin.customers.retry')}
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

          <CustomersCatalogTable
            customers={list.customers}
            loading={list.loading}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            emptyAction={
              list.hasActiveFilters ? (
                <Button type="button" variant="outline" onClick={list.clearFilters}>
                  {t('admin.customers.clearFilters')}
                </Button>
              ) : undefined
            }
            showingCount={showingCount}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={list.setPage}
            onOpenCustomer={openDrawer}
          />
        </>
      )}

      <CustomerDetailsDrawer
        open={Boolean(drawerCustomerId)}
        customerId={drawerCustomerId}
        onClose={closeDrawer}
      />
    </>
  )
}
