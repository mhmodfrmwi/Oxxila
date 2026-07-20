// src/pages/admin/AdminOrdersPage.tsx
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { OrderDetailsDrawer } from '../../components/admin/orders/OrderDetailsDrawer'
import { OrdersCatalogTable } from '../../components/admin/orders/OrdersCatalogTable'
import { OrdersListToolbar } from '../../components/admin/orders/OrdersListToolbar'
import { OrdersStatusTabs } from '../../components/admin/orders/OrdersStatusTabs'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { useAdminOrders } from '../../hooks/useAdminOrders'

/**
 * Orders Management — list + read-only details drawer (Phase 3A/3B).
 * Figma: Orders Management `937:18568` / Order Details drawer `941:43893`.
 */
export function AdminOrdersPage() {
  const { t } = useTranslation()
  const list = useAdminOrders()
  const [drawerOrderId, setDrawerOrderId] = useState<string | null>(null)

  const openDrawer = useCallback((orderId: string) => {
    setDrawerOrderId(orderId)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOrderId(null)
  }, [])

  const failed = Boolean(list.error) && !list.loading && list.orders.length === 0
  const staleError = Boolean(list.error) && list.orders.length > 0
  const currentPage = list.pagination?.currentPage ?? list.filters.page
  const totalPages = Math.max(list.pagination?.numberOfPages ?? 1, 1)
  const totalCount = list.pagination?.totalDocuments ?? list.orders.length
  const showingCount = list.orders.length

  const emptyTitle = list.hasActiveFilters
    ? t('admin.orders.emptyFilteredTitle')
    : t('admin.orders.emptyTitle')
  const emptyDescription = list.searchNeedsObjectId
    ? t('admin.orders.searchObjectIdHint')
    : list.hasActiveFilters
      ? t('admin.orders.emptyFilteredDescription')
      : t('admin.orders.emptyDescription')

  return (
    <>
      <AdminPageHeader
        title={t('admin.orders.title')}
        subtitle={t('admin.orders.subtitle')}
        actions={
          <OrdersListToolbar
            keyword={list.filters.keyword}
            dateFrom={list.filters.dateFrom}
            dateTo={list.filters.dateTo}
            onKeywordChange={list.setKeyword}
            onDateFromChange={list.setDateFrom}
            onDateToChange={list.setDateTo}
            disabled={list.loading && list.orders.length === 0}
          />
        }
      />

      <OrdersStatusTabs
        active={list.filters.statusTab}
        activeCount={totalCount}
        onChange={list.setStatusTab}
        disabled={list.loading && list.orders.length === 0}
      />

      {failed ? (
        <EmptyState
          title={t('admin.orders.loadErrorTitle')}
          description={list.error ?? t('admin.orders.loadErrorDescription')}
          action={
            <Button type="button" variant="outline" onClick={list.reload}>
              {t('admin.orders.retry')}
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

          <OrdersCatalogTable
            orders={list.orders}
            loading={list.loading}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            emptyAction={
              list.hasActiveFilters ? (
                <Button type="button" variant="outline" onClick={list.clearFilters}>
                  {t('admin.orders.clearFilters')}
                </Button>
              ) : undefined
            }
            showingCount={showingCount}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={list.setPage}
            onOpenOrder={openDrawer}
          />
        </>
      )}

      <OrderDetailsDrawer
        open={Boolean(drawerOrderId)}
        orderId={drawerOrderId}
        onClose={closeDrawer}
      />
    </>
  )
}
