// src/pages/admin/AdminShippingPage.tsx
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { CourierCompaniesTable } from '../../components/admin/shipping/CourierCompaniesTable'
import { OrdersShippingTable } from '../../components/admin/shipping/OrdersShippingTable'
import { ShipmentDetailsDrawer } from '../../components/admin/shipping/ShipmentDetailsDrawer'
import { ShippingListToolbar } from '../../components/admin/shipping/ShippingListToolbar'
import { ShippingMethodPanel } from '../../components/admin/shipping/ShippingMethodPanel'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { useAdminShipping } from '../../hooks/useAdminShipping'

/**
 * Shipping Management — list (6A) + read-only shipment details drawer (6B).
 * Figma: Shipping `974:19423` / drawer pattern from Order Details (no dedicated details frame).
 */
export function AdminShippingPage() {
  const { t } = useTranslation()
  const list = useAdminShipping()
  const [drawerOrderId, setDrawerOrderId] = useState<string | null>(null)

  const openDrawer = useCallback((orderId: string) => {
    setDrawerOrderId(orderId)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOrderId(null)
  }, [])

  const carriersFailed =
    Boolean(list.carriersError) &&
    !list.carriersLoading &&
    list.allCarriers.length === 0
  const ordersFailed =
    Boolean(list.ordersError) &&
    !list.ordersLoading &&
    list.orders.length === 0

  const pageFailed = carriersFailed && ordersFailed

  const carriersEmptyTitle = list.hasActiveFilters
    ? t('admin.shipping.carriers.emptyFilteredTitle')
    : t('admin.shipping.carriers.emptyTitle')
  const carriersEmptyDescription = list.hasActiveFilters
    ? t('admin.shipping.carriers.emptyFilteredDescription')
    : t('admin.shipping.carriers.emptyDescription')

  const ordersEmptyTitle =
    list.searchNeedsObjectId || list.hasActiveFilters
      ? t('admin.shipping.orders.emptyFilteredTitle')
      : t('admin.shipping.orders.emptyTitle')
  const ordersEmptyDescription = list.searchNeedsObjectId
    ? t('admin.shipping.orders.searchHint')
    : list.hasActiveFilters
      ? t('admin.shipping.orders.emptyFilteredDescription')
      : t('admin.shipping.orders.emptyDescription')

  const currentPage = list.pagination?.currentPage ?? list.filters.page
  const totalPages = Math.max(list.pagination?.numberOfPages ?? 1, 1)
  const totalCount = list.pagination?.totalDocuments ?? list.orders.length
  const showingCount = list.orders.length

  return (
    <>
      <AdminPageHeader
        title={t('admin.shipping.title')}
        subtitle={t('admin.shipping.subtitle')}
        actions={
          <ShippingListToolbar
            keyword={list.filters.keyword}
            onKeywordChange={list.setKeyword}
            disabled={
              list.carriersLoading &&
              list.ordersLoading &&
              list.allCarriers.length === 0 &&
              list.orders.length === 0
            }
          />
        }
      />

      {pageFailed ? (
        <EmptyState
          title={t('admin.shipping.loadErrorTitle')}
          description={
            list.carriersError ??
            list.ordersError ??
            t('admin.shipping.loadErrorDescription')
          }
          action={
            <Button type="button" variant="outline" onClick={list.reload}>
              {t('admin.shipping.retry')}
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:gap-[38px]">
          <div className="flex min-w-0 flex-1 flex-col gap-8">
            {carriersFailed ? (
              <EmptyState
                title={t('admin.shipping.carriers.loadErrorTitle')}
                description={
                  list.carriersError ?? t('admin.shipping.loadErrorDescription')
                }
                action={
                  <Button type="button" variant="outline" onClick={list.reload}>
                    {t('admin.shipping.retry')}
                  </Button>
                }
              />
            ) : (
              <>
                {list.carriersError && list.allCarriers.length > 0 ? (
                  <p
                    className="rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
                    role="alert"
                  >
                    {list.carriersError}
                  </p>
                ) : null}
                <CourierCompaniesTable
                  carriers={list.carriers}
                  loading={list.carriersLoading}
                  emptyTitle={carriersEmptyTitle}
                  emptyDescription={carriersEmptyDescription}
                  emptyAction={
                    list.hasActiveFilters ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={list.clearFilters}
                      >
                        {t('admin.shipping.clearFilters')}
                      </Button>
                    ) : undefined
                  }
                />
              </>
            )}

            {ordersFailed ? (
              <EmptyState
                title={t('admin.shipping.orders.loadErrorTitle')}
                description={
                  list.ordersError ?? t('admin.shipping.loadErrorDescription')
                }
                action={
                  <Button type="button" variant="outline" onClick={list.reload}>
                    {t('admin.shipping.retry')}
                  </Button>
                }
              />
            ) : (
              <>
                {list.ordersError && list.orders.length > 0 ? (
                  <p
                    className="rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
                    role="alert"
                  >
                    {list.ordersError}
                  </p>
                ) : null}
                <OrdersShippingTable
                  orders={list.orders}
                  loading={list.ordersLoading}
                  emptyTitle={ordersEmptyTitle}
                  emptyDescription={ordersEmptyDescription}
                  emptyAction={
                    list.hasActiveFilters ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={list.clearFilters}
                      >
                        {t('admin.shipping.clearFilters')}
                      </Button>
                    ) : undefined
                  }
                  showingCount={showingCount}
                  totalCount={totalCount}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  statusTab={list.filters.ordersTab}
                  onStatusTabChange={list.setOrdersTab}
                  onPageChange={list.setPage}
                  onOpenShipment={openDrawer}
                />
              </>
            )}
          </div>

          <div className="w-full shrink-0 xl:w-[min(100%,22rem)]">
            <ShippingMethodPanel
              courierEnabled={list.hasCourierMethod}
              inHouseEnabled={list.hasInHouseMethod}
            />
          </div>
        </div>
      )}

      <ShipmentDetailsDrawer
        open={Boolean(drawerOrderId)}
        orderId={drawerOrderId}
        onClose={closeDrawer}
      />
    </>
  )
}
