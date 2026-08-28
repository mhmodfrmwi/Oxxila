// src/components/admin/orders/OrdersCatalogTable.tsx
import { Truck } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { AdminOrderRow } from '../../../types/adminOrders'
import {
  formatAdminOrderDate,
  formatAdminOrderMoney,
  orderStatusBadgeTone,
} from '../../../utils/adminOrdersFormat'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import { DataTable, type DataTableColumn } from '../ui/DataTable'
import { AdminPersonCell } from '../ui/AdminPersonCell'
import { StatusBadge } from '../ui/StatusBadge'
import { OrderRowActionsMenu } from './OrderRowActionsMenu'

interface OrdersCatalogTableProps {
  orders: readonly AdminOrderRow[]
  loading?: boolean
  emptyTitle: string
  emptyDescription?: string
  emptyAction?: ReactNode
  showingCount: number
  totalCount: number
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onOpenOrder?: (orderId: string) => void
  /** Opens the order drawer focused on the Assign panel. */
  onAssignOrder?: (orderId: string) => void
  onCancelOrder?: (order: AdminOrderRow) => void
  onChangeStatus?: (order: AdminOrderRow) => void
}

function CustomerCell({
  name,
  email,
  initials,
}: {
  name: string
  email: string | null
  initials: string
}) {
  return <AdminPersonCell name={name} email={email} initials={initials} />
}

export function OrdersCatalogTable({
  orders,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
  showingCount,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onOpenOrder,
  onAssignOrder,
  onCancelOrder,
  onChangeStatus,
}: OrdersCatalogTableProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  const columns = useMemo<DataTableColumn<AdminOrderRow>[]>(
    () => [
      {
        id: 'orderId',
        header: t('admin.orders.columns.orderId'),
        cell: (row) => (
          <span className="text-sm font-semibold text-[#e2e2e2]">
            {row.orderNumber}
          </span>
        ),
      },
      {
        id: 'date',
        header: t('admin.orders.columns.date'),
        cell: (row) => (
          <time
            dateTime={row.createdAt}
            className="text-sm text-white/60"
          >
            {formatAdminOrderDate(row.createdAt, locale)}
          </time>
        ),
      },
      {
        id: 'customer',
        header: t('admin.orders.columns.customer'),
        cell: (row) => (
          <CustomerCell
            name={row.customerName}
            email={row.customerEmail}
            initials={row.customerInitials}
          />
        ),
      },
      {
        id: 'carrier',
        header: t('admin.orders.columns.carrier'),
        cell: (row) =>
          row.hasCommittedCarrier && row.carrierName ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-white/80">
              <Truck size={13} className="text-[#a394ff]" aria-hidden />
              {row.carrierName}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onAssignOrder?.(row.id)}
              aria-label={t('admin.orders.carrierCell.assignAria', {
                id: row.orderNumber,
              })}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border border-[#a394ff]/30 bg-[rgba(163,148,255,0.1)]',
                'px-3 py-1 text-xs font-semibold text-[#a394ff] transition-colors hover:bg-[rgba(163,148,255,0.18)]',
                focusRingClasses,
              )}
            >
              {t('admin.orders.carrierCell.assign')}
            </button>
          ),
      },
      {
        id: 'tracking',
        header: t('admin.orders.columns.tracking'),
        cell: (row) => (
          <span className="truncate text-sm text-white/60">
            {row.trackingLabel ?? t('admin.orders.carrierCell.unassigned')}
          </span>
        ),
      },
      {
        id: 'status',
        header: t('admin.orders.columns.orderStatus'),
        headerClassName: 'text-center',
        className: 'text-center',
        cell: (row) => (
          <StatusBadge
            tone={orderStatusBadgeTone(row.orderStatus)}
            className={cn(
              'border border-current/20 text-[8px] font-bold tracking-[0.05em]',
              row.orderStatus === 'delivered' &&
                'shadow-[0_0_10px_0_rgba(52,211,153,0.1)]',
            )}
          >
            {t(`admin.orders.orderStatus.${row.orderStatus}`, {
              defaultValue: row.orderStatusLabel,
            })}
          </StatusBadge>
        ),
      },
      {
        id: 'total',
        header: t('admin.orders.columns.total'),
        headerClassName: 'text-end',
        className: 'text-end',
        cell: (row) => (
          <span
            className={cn(
              'text-base font-bold tabular-nums',
              row.totalPrice < 0 ? 'text-support-error' : 'text-accent',
            )}
          >
            {formatAdminOrderMoney(row.totalPrice, locale)}
          </span>
        ),
      },
      {
        id: 'action',
        header: t('admin.orders.columns.action'),
        headerClassName: 'text-center',
        className: 'text-center',
        cell: (row) => (
          <OrderRowActionsMenu
            order={row}
            onOpenOrder={(orderId) => onOpenOrder?.(orderId)}
            onCancelOrder={(order) => onCancelOrder?.(order)}
            onChangeStatus={(order) => onChangeStatus?.(order)}
          />
        ),
      },
    ],
    [locale, onOpenOrder, onAssignOrder, onCancelOrder, onChangeStatus, t],
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
      aria-label={t('admin.orders.tableAria')}
      className="rounded-[1.6rem]"
      onRowDoubleClick={
        onOpenOrder
          ? (row) => {
              onOpenOrder(row.id)
            }
          : undefined
      }
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="text-[8px] font-bold uppercase tracking-[0.08em] text-white/30"
            aria-live="polite"
          >
            {t('admin.orders.showing', {
              showing: showingCount,
              total: totalCount,
            })}
          </p>
          <div
            className="flex items-center gap-2"
            role="group"
            aria-label={t('admin.orders.paginationAria')}
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
              {t('admin.orders.prev')}
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
              {t('admin.orders.next')}
            </button>
          </div>
        </div>
      }
    />
  )
}
