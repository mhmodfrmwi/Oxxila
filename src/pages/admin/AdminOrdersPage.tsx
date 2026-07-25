// src/pages/admin/AdminOrdersPage.tsx
import { Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { B2BOrderDrawer } from '../../components/admin/orders/B2BOrderDrawer'
import { CancelOrderDialog } from '../../components/admin/orders/CancelOrderDialog'
import { ChangeOrderStatusDialog } from '../../components/admin/orders/ChangeOrderStatusDialog'
import { OrderDetailsDrawer } from '../../components/admin/orders/OrderDetailsDrawer'
import { OrdersCatalogTable } from '../../components/admin/orders/OrdersCatalogTable'
import { OrdersListToolbar } from '../../components/admin/orders/OrdersListToolbar'
import { OrdersStatusTabs } from '../../components/admin/orders/OrdersStatusTabs'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { focusRingClasses } from '../../components/ui/interactionStyles'
import { useAdminOrders } from '../../hooks/useAdminOrders'
import { cn } from '../../lib/cn'
import type { AdminOrderRow } from '../../types/adminOrders'

/**
 * Orders Management — list + details drawer, status update, Assign Carrier, B2B create, cancel.
 */
export function AdminOrdersPage() {
  const { t } = useTranslation()
  const list = useAdminOrders()
  const [drawerOrderId, setDrawerOrderId] = useState<string | null>(null)
  const [b2bDrawerOpen, setB2bDrawerOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<AdminOrderRow | null>(null)
  const [statusTarget, setStatusTarget] = useState<AdminOrderRow | null>(null)

  const openDrawer = useCallback((orderId: string) => {
    setDrawerOrderId(orderId)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOrderId(null)
  }, [])

  const openB2bDrawer = useCallback(() => setB2bDrawerOpen(true), [])
  const closeB2bDrawer = useCallback(() => setB2bDrawerOpen(false), [])
  const handleB2bCreated = useCallback(() => {
    list.reload()
  }, [list])

  const handleCancelFromMenu = useCallback((order: AdminOrderRow) => {
    setCancelTarget(order)
  }, [])

  const handleCancelClosed = useCallback(() => {
    setCancelTarget(null)
  }, [])

  const handleCancelled = useCallback(() => {
    setCancelTarget(null)
    list.reload()
  }, [list])

  const handleChangeStatusFromMenu = useCallback((order: AdminOrderRow) => {
    setStatusTarget(order)
  }, [])

  const handleStatusClosed = useCallback(() => {
    setStatusTarget(null)
  }, [])

  const handleStatusUpdated = useCallback(() => {
    setStatusTarget(null)
    list.reload()
  }, [list])

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
          <>
            <OrdersListToolbar
              keyword={list.filters.keyword}
              dateFrom={list.filters.dateFrom}
              dateTo={list.filters.dateTo}
              onKeywordChange={list.setKeyword}
              onDateFromChange={list.setDateFrom}
              onDateToChange={list.setDateTo}
              disabled={list.loading && list.orders.length === 0}
            />
            <button
              type="button"
              onClick={openB2bDrawer}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-2xl',
                'bg-gradient-to-r from-[#a394ff] to-[#8274d6] px-4 py-2.5',
                'text-sm font-bold text-white transition-opacity hover:opacity-90',
                focusRingClasses,
              )}
            >
              <Plus size={14} aria-hidden />
              {t('admin.orders.addOrder')}
            </button>
          </>
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
            onAssignOrder={openDrawer}
            onCancelOrder={handleCancelFromMenu}
            onChangeStatus={handleChangeStatusFromMenu}
          />
        </>
      )}

      <OrderDetailsDrawer
        open={Boolean(drawerOrderId)}
        orderId={drawerOrderId}
        onClose={closeDrawer}
        onOrderChanged={list.reload}
      />

      <B2BOrderDrawer
        open={b2bDrawerOpen}
        onClose={closeB2bDrawer}
        onCreated={handleB2bCreated}
      />

      <CancelOrderDialog
        key={cancelTarget?.id ?? 'table-cancel'}
        open={Boolean(cancelTarget)}
        orderId={cancelTarget?.id ?? null}
        orderNumber={cancelTarget?.orderNumber ?? null}
        onClose={handleCancelClosed}
        onCancelled={handleCancelled}
      />

      <ChangeOrderStatusDialog
        key={statusTarget?.id ?? 'table-status'}
        open={Boolean(statusTarget)}
        orderId={statusTarget?.id ?? null}
        orderNumber={statusTarget?.orderNumber ?? null}
        currentStatus={statusTarget?.orderStatus ?? null}
        onClose={handleStatusClosed}
        onUpdated={handleStatusUpdated}
      />
    </>
  )
}
