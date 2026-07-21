// src/components/admin/shipping/OrdersShippingTable.tsx
import { useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  AdminShippingOrderRow,
  AdminShippingOrdersTab,
} from '../../../types/adminShipping'
import { shippingOrderStatusBadgeTone } from '../../../utils/adminShippingFormat'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import { DataTable, type DataTableColumn } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatusBadge'
import { ShippingOrdersStatusTabs } from './ShippingOrdersStatusTabs'

interface OrdersShippingTableProps {
  orders: readonly AdminShippingOrderRow[]
  loading?: boolean
  emptyTitle: string
  emptyDescription?: string
  emptyAction?: ReactNode
  showingCount: number
  totalCount: number
  currentPage: number
  totalPages: number
  statusTab: AdminShippingOrdersTab
  onStatusTabChange: (tab: AdminShippingOrdersTab) => void
  onPageChange: (page: number) => void
  onOpenShipment?: (orderId: string) => void
}

function formatMethodLabel(
  row: AdminShippingOrderRow,
  t: (key: string, options?: Record<string, string>) => string,
): string {
  if (row.methodKind === 'in_house') {
    return t('admin.shipping.orders.methodInHouse')
  }
  if (row.methodKind === 'courier' && row.carrierName) {
    return t('admin.shipping.orders.methodCourier', { name: row.carrierName })
  }
  if (row.methodKind === 'courier') {
    return t('admin.shipping.orders.methodCourierGeneric')
  }
  return '—'
}

export function OrdersShippingTable({
  orders,
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
  onOpenShipment,
}: OrdersShippingTableProps) {
  const { t } = useTranslation()

  const columns = useMemo<DataTableColumn<AdminShippingOrderRow>[]>(
    () => [
      {
        id: 'orderId',
        header: t('admin.shipping.orders.columns.orderId'),
        cell: (row) => (
          <span className="text-sm font-bold text-white">{row.orderNumber}</span>
        ),
      },
      {
        id: 'patient',
        header: t('admin.shipping.orders.columns.patient'),
        cell: (row) => (
          <span className="text-sm text-white/80" title={row.customerName}>
            {row.customerName}
          </span>
        ),
      },
      {
        id: 'method',
        header: t('admin.shipping.orders.columns.method'),
        cell: (row) => (
          <span className="text-[10px] uppercase tracking-wide text-white/40">
            {formatMethodLabel(row, t)}
          </span>
        ),
      },
      {
        id: 'status',
        header: t('admin.shipping.orders.columns.status'),
        cell: (row) => (
          <StatusBadge
            tone={shippingOrderStatusBadgeTone(row.orderStatus)}
            className={cn(
              'border border-current/20 px-2.5 py-0.5 text-[9px] font-bold',
              row.orderStatus === 'delivered' &&
                'shadow-[0_0_10px_0_rgba(52,211,153,0.1)]',
            )}
          >
            {t(`admin.orders.orderStatus.${row.orderStatus}`, {
              defaultValue: row.statusLabel,
            })}
          </StatusBadge>
        ),
      },
      {
        id: 'tracking',
        header: t('admin.shipping.orders.columns.tracking'),
        cell: (row) => (
          <span
            className={cn(
              'text-[10px] tracking-tight text-white/60',
              row.trackingOrDriver !== '—' && 'font-mono',
            )}
            title={row.trackingOrDriver}
          >
            {row.trackingOrDriver}
          </span>
        ),
      },
      {
        id: 'action',
        header: t('admin.shipping.orders.columns.action'),
        headerClassName: 'text-end',
        className: 'text-end',
        cell: (row) => (
          <button
            type="button"
            onClick={() => onOpenShipment?.(row.id)}
            className={cn(
              'text-[10px] font-bold uppercase text-[#a394ff]',
              'transition-opacity hover:opacity-80',
              focusRingClasses,
            )}
            aria-label={t('admin.shipping.orders.updateAria', {
              id: row.orderNumber,
            })}
          >
            {t('admin.shipping.orders.update')}
          </button>
        ),
      },
    ],
    [onOpenShipment, t],
  )

  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages && totalPages > 1

  return (
    <DataTable
      columns={columns}
      rows={orders}
      getRowId={(row) => row.id}
      loading={loading}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyAction={emptyAction}
      aria-label={t('admin.shipping.orders.tableAria')}
      className="rounded-[2.5rem]"
      toolbar={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-[family-name:var(--admin-font-display)] text-xl font-normal text-white">
            {t('admin.shipping.orders.title')}
          </h3>
          <ShippingOrdersStatusTabs
            active={statusTab}
            onChange={onStatusTabChange}
            disabled={loading && orders.length === 0}
          />
        </div>
      }
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/30"
            aria-live="polite"
          >
            {t('admin.shipping.orders.showing', {
              showing: showingCount,
              total: totalCount,
            })}
          </p>
          <div
            className="flex items-center gap-2"
            role="group"
            aria-label={t('admin.shipping.orders.paginationAria')}
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
              {t('admin.shipping.orders.prev')}
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
              {t('admin.shipping.orders.next')}
            </button>
          </div>
        </div>
      }
    />
  )
}
