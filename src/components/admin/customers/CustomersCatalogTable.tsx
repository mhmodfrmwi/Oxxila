// src/components/admin/customers/CustomersCatalogTable.tsx
import { ChevronRight } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { AdminCustomerRow } from '../../../types/adminCustomers'
import {
  formatCustomerDate,
  formatCustomerMoney,
  formatUnavailableMetric,
} from '../../../utils/adminCustomersFormat'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import { DataTable, type DataTableColumn } from '../ui/DataTable'

interface CustomersCatalogTableProps {
  customers: readonly AdminCustomerRow[]
  loading?: boolean
  emptyTitle: string
  emptyDescription?: string
  emptyAction?: ReactNode
  showingCount: number
  totalCount: number
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onOpenCustomer?: (customerId: string) => void
}

function CustomerNameCell({
  name,
  email,
  avatar,
  initials,
}: {
  name: string
  email: string
  avatar: string | null
  initials: string
}) {
  return (
    <div className="flex min-w-[12rem] items-center gap-4">
      {avatar ? (
        <img
          src={avatar}
          alt=""
          className="size-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[rgba(163,148,255,0.2)] text-[11px] font-bold text-[#a394ff]"
          aria-hidden
        >
          {initials}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-5 text-white" title={name}>
          {name}
        </p>
        <p className="truncate text-[10px] leading-3 text-white/40" title={email}>
          {email}
        </p>
      </div>
    </div>
  )
}

export function CustomersCatalogTable({
  customers,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
  showingCount,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onOpenCustomer,
}: CustomersCatalogTableProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const unavailable = formatUnavailableMetric()

  const columns = useMemo<DataTableColumn<AdminCustomerRow>[]>(
    () => [
      {
        id: 'customer',
        header: t('admin.customers.columns.customerName'),
        cell: (row) => (
          <CustomerNameCell
            name={row.name}
            email={row.email}
            avatar={row.avatar}
            initials={row.initials}
          />
        ),
      },
      {
        id: 'orders',
        header: t('admin.customers.columns.orders'),
        cell: (row) => (
          <span className="text-sm text-white/70">
            {row.ordersCount == null
              ? unavailable
              : String(row.ordersCount)}
          </span>
        ),
      },
      {
        id: 'ltv',
        header: t('admin.customers.columns.ltv'),
        cell: (row) => (
          <span className="text-sm font-medium text-white">
            {row.ltv == null
              ? unavailable
              : formatCustomerMoney(row.ltv, locale)}
          </span>
        ),
      },
      {
        id: 'lastVisit',
        header: t('admin.customers.columns.lastVisit'),
        cell: (row) =>
          row.lastVisitAt ? (
            <time dateTime={row.lastVisitAt} className="text-sm text-white/60">
              {formatCustomerDate(row.lastVisitAt, locale)}
            </time>
          ) : (
            <span className="text-sm text-white/40">{unavailable}</span>
          ),
      },
      {
        id: 'actions',
        header: t('admin.customers.columns.actions'),
        headerClassName: 'text-end',
        className: 'text-end',
        cell: (row) => (
          <button
            type="button"
            onClick={() => onOpenCustomer?.(row.id)}
            className={cn(
              'inline-flex size-8 items-center justify-center rounded-full',
              'border border-white/10 bg-white/5 text-white/70',
              'transition-colors hover:bg-white/10 hover:text-white',
              focusRingClasses,
            )}
            aria-label={t('admin.customers.actionAria', { name: row.name })}
          >
            <ChevronRight size={16} aria-hidden />
          </button>
        ),
      },
    ],
    [locale, onOpenCustomer, t, unavailable],
  )

  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages && totalPages > 1

  return (
    <DataTable
      columns={columns}
      rows={customers}
      getRowId={(row) => row.id}
      loading={loading}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyAction={emptyAction}
      aria-label={t('admin.customers.tableAria')}
      className="rounded-[2rem]"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/30"
            aria-live="polite"
          >
            {t('admin.customers.showing', {
              showing: showingCount,
              total: totalCount,
            })}
          </p>
          <div
            className="flex items-center gap-2"
            role="group"
            aria-label={t('admin.customers.paginationAria')}
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
              {t('admin.customers.prev')}
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
              {t('admin.customers.next')}
            </button>
          </div>
        </div>
      }
    />
  )
}
