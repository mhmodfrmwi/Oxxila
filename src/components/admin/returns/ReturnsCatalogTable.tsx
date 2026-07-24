// src/components/admin/returns/ReturnsCatalogTable.tsx
import { useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { AdminReturnRow } from '../../../types/adminReturns'
import {
  formatAdminReturnMoney,
  returnStatusBadgeTone,
} from '../../../utils/adminReturnsFormat'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import { DataTable, type DataTableColumn } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatusBadge'

interface ReturnsCatalogTableProps {
  returns: readonly AdminReturnRow[]
  loading?: boolean
  emptyTitle: string
  emptyDescription?: string
  emptyAction?: ReactNode
  showingCount: number
  totalCount: number
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  selectedReturnId: string | null
  onSelectReturn: (returnId: string) => void
}

function UserCell({ name, email }: { name: string; email: string | null }) {
  return (
    <div className="min-w-0 flex flex-col">
      <span className="truncate text-sm font-medium text-[#e2e2e2]" title={name}>
        {name}
      </span>
      {email ? (
        <span className="truncate text-xs leading-5 text-white/45" title={email}>
          {email}
        </span>
      ) : null}
    </div>
  )
}

export function ReturnsCatalogTable({
  returns,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
  showingCount,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  selectedReturnId,
  onSelectReturn,
}: ReturnsCatalogTableProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  const columns = useMemo<DataTableColumn<AdminReturnRow>[]>(
    () => [
      {
        id: 'id',
        header: t('admin.returns.columns.id'),
        cell: (row) => (
          <span className="text-sm font-semibold text-[#e2e2e2]">{row.shortId}</span>
        ),
      },
      {
        id: 'user',
        header: t('admin.returns.columns.user'),
        cell: (row) => <UserCell name={row.userName} email={row.userEmail} />,
      },
      {
        id: 'order',
        header: t('admin.returns.columns.order'),
        cell: (row) => (
          <span className="text-sm text-white/70">
            {row.orderShortLabel ?? t('admin.returns.unknownOrder')}
          </span>
        ),
      },
      {
        id: 'amount',
        header: t('admin.returns.columns.amount'),
        headerClassName: 'text-end',
        className: 'text-end',
        cell: (row) => (
          <span className="text-base font-bold tabular-nums text-accent">
            {formatAdminReturnMoney(row.refundAmount, locale)}
          </span>
        ),
      },
      {
        id: 'status',
        header: t('admin.returns.columns.status'),
        headerClassName: 'text-center',
        className: 'text-center',
        cell: (row) => (
          <StatusBadge
            tone={returnStatusBadgeTone(row.refundStatus)}
            className="border border-current/20 text-[8px] font-bold tracking-[0.05em]"
          >
            {t(`admin.returns.status.${row.refundStatus}`)}
          </StatusBadge>
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
      rows={returns}
      getRowId={(row) => row.id}
      loading={loading}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyAction={emptyAction}
      aria-label={t('admin.returns.tableAria')}
      className="rounded-[1.6rem]"
      selectedRowId={selectedReturnId}
      onRowClick={(row) => onSelectReturn(row.id)}
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="text-[8px] font-bold uppercase tracking-[0.08em] text-white/30"
            aria-live="polite"
          >
            {t('admin.returns.showing', { showing: showingCount, total: totalCount })}
          </p>
          <div
            className="flex items-center gap-2"
            role="group"
            aria-label={t('admin.returns.paginationAria')}
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
              {t('admin.returns.prev')}
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
              {t('admin.returns.next')}
            </button>
          </div>
        </div>
      }
    />
  )
}
