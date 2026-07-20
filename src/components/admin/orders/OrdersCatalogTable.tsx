// src/components/admin/orders/OrdersCatalogTable.tsx
import { MoreHorizontal } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { AdminOrderRow } from '../../../types/adminOrders'
import {
  formatAdminOrderDate,
  formatAdminOrderMoney,
  orderStatusBadgeTone,
  paymentStatusBadgeTone,
} from '../../../utils/adminOrdersFormat'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import { DataTable, type DataTableColumn } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatusBadge'

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
}

function CustomerCell({
  name,
  initials,
}: {
  name: string
  initials: string
}) {
  return (
    <div className="flex min-w-[10rem] items-center gap-3">
      <span
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[rgb(97_95_255_/_0.2)] text-[10px] font-bold text-[#a3b3ff]"
        aria-hidden
      >
        {initials}
      </span>
      <span className="truncate text-sm font-medium text-[#e2e2e2]" title={name}>
        {name}
      </span>
    </div>
  )
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
          <CustomerCell name={row.customerName} initials={row.customerInitials} />
        ),
      },
      {
        id: 'payment',
        header: t('admin.orders.columns.paymentStatus'),
        headerClassName: 'text-center',
        className: 'text-center',
        cell: (row) => (
          <StatusBadge
            tone={paymentStatusBadgeTone(row.paymentStatus)}
            className="border border-current/20 text-[10px] font-bold tracking-[0.05em]"
          >
            {t(`admin.orders.paymentStatus.${row.paymentStatus}`, {
              defaultValue: row.paymentStatusLabel,
            })}
          </StatusBadge>
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
              'border border-current/20 text-[10px] font-bold tracking-[0.05em]',
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
          <button
            type="button"
            disabled
            className={cn(
              'inline-flex rounded-lg p-2 text-white/40',
              'cursor-not-allowed opacity-50',
              focusRingClasses,
            )}
            aria-label={t('admin.orders.actionAria', { id: row.orderNumber })}
            title={t('admin.orders.actionSoon')}
          >
            <MoreHorizontal size={24} aria-hidden />
          </button>
        ),
      },
    ],
    [locale, t],
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
      className="rounded-[2rem]"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/30"
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
