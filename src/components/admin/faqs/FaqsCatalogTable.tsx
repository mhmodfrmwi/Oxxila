// src/components/admin/faqs/FaqsCatalogTable.tsx
import { Pencil, Trash2 } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import type { AdminFaqRow } from '../../../types/adminFaqs'
import { formatDashboardDate, formatDashboardNumber } from '../../../utils/adminDashboardFormat'
import { truncateFaqAnswer } from '../../../utils/adminFaqsFormat'
import { focusRingClasses } from '../../ui/interactionStyles'
import { DataTable, type DataTableColumn } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatusBadge'

interface FaqsCatalogTableProps {
  faqs: readonly AdminFaqRow[]
  loading?: boolean
  emptyTitle: string
  emptyDescription?: string
  emptyAction?: ReactNode
  showingCount: number
  totalCount: number
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  togglingFaqId?: string | null
  deletingFaqId?: string | null
  onEditFaq?: (faq: AdminFaqRow) => void
  onDeleteFaq?: (faq: AdminFaqRow) => void
  onToggleActive?: (faqId: string) => void
}

function ActiveSwitch({
  checked,
  label,
  disabled,
  onToggle,
}: {
  checked: boolean
  label: string
  disabled?: boolean
  onToggle?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors',
        checked ? 'border-accent/40 bg-accent' : 'border-white/15 bg-white/15',
        'disabled:pointer-events-none disabled:opacity-50',
        focusRingClasses,
      )}
      role="switch"
      aria-checked={checked}
      aria-busy={disabled || undefined}
      aria-label={label}
      title={label}
    >
      <span
        className={cn(
          'absolute top-0.5 start-0.5 size-4 rounded-full bg-white shadow transition-transform',
          checked && 'translate-x-4 rtl:-translate-x-4',
        )}
        aria-hidden
      />
    </button>
  )
}

export function FaqsCatalogTable({
  faqs,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
  showingCount,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  togglingFaqId = null,
  deletingFaqId = null,
  onEditFaq,
  onDeleteFaq,
  onToggleActive,
}: FaqsCatalogTableProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages && totalPages > 1

  const columns = useMemo<DataTableColumn<AdminFaqRow>[]>(
    () => [
      {
        id: 'question',
        header: t('admin.faqs.columns.question'),
        cell: (row) => (
          <p
            className="max-w-[16rem] truncate text-sm font-bold text-primary-text"
            title={row.question}
          >
            {row.question}
          </p>
        ),
      },
      {
        id: 'answer',
        header: t('admin.faqs.columns.answer'),
        cell: (row) => {
          const preview = truncateFaqAnswer(row.answer)
          return (
            <p
              className="max-w-[18rem] truncate text-sm text-secondary-text"
              title={row.answer}
            >
              {preview || '—'}
            </p>
          )
        },
      },
      {
        id: 'product',
        header: t('admin.faqs.columns.product'),
        cell: (row) =>
          row.productName ? (
            <span className="text-sm text-primary-text">{row.productName}</span>
          ) : (
            <span
              className="text-sm text-secondary-text"
              aria-label={t('admin.faqs.noProduct')}
            >
              —
            </span>
          ),
      },
      {
        id: 'status',
        header: t('admin.faqs.columns.status'),
        cell: (row) => {
          const busy = togglingFaqId === row.id
          return (
            <div className="flex items-center gap-2">
              <ActiveSwitch
                checked={row.isActive}
                disabled={busy || loading}
                label={
                  row.isActive
                    ? t('admin.faqs.toggle.offAria', { name: row.question })
                    : t('admin.faqs.toggle.onAria', { name: row.question })
                }
                onToggle={() => onToggleActive?.(row.id)}
              />
              <StatusBadge tone={row.isActive ? 'success' : 'neutral'}>
                {row.isActive
                  ? t('admin.faqs.active')
                  : t('admin.faqs.inactive')}
              </StatusBadge>
            </div>
          )
        },
      },
      {
        id: 'updated',
        header: t('admin.faqs.columns.updated'),
        cell: (row) =>
          row.updatedAt ? (
            <time
              dateTime={row.updatedAt}
              className="text-sm text-secondary-text"
            >
              {formatDashboardDate(row.updatedAt, locale)}
            </time>
          ) : (
            <span className="text-sm text-secondary-text">—</span>
          ),
      },
      {
        id: 'actions',
        header: t('admin.faqs.columns.actions'),
        headerClassName: 'text-end',
        className: 'text-end',
        cell: (row) => (
          <div className="inline-flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onEditFaq?.(row)}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-lg text-white/50',
                'transition-colors hover:bg-white/10 hover:text-white',
                focusRingClasses,
              )}
              aria-label={t('admin.faqs.editAria', { name: row.question })}
            >
              <Pencil size={13} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => onDeleteFaq?.(row)}
              disabled={deletingFaqId === row.id}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-lg text-white/50',
                'transition-colors hover:bg-support-error/10 hover:text-support-error',
                'disabled:pointer-events-none disabled:opacity-40',
                focusRingClasses,
              )}
              aria-label={t('admin.faqs.deleteAria', { name: row.question })}
            >
              <Trash2 size={13} aria-hidden />
            </button>
          </div>
        ),
      },
    ],
    [
      deletingFaqId,
      loading,
      locale,
      onDeleteFaq,
      onEditFaq,
      onToggleActive,
      t,
      togglingFaqId,
    ],
  )

  return (
    <DataTable
      columns={columns}
      rows={faqs}
      getRowId={(row) => row.id}
      loading={loading}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyAction={emptyAction}
      aria-label={t('admin.faqs.tableAria')}
      density="spacious"
      className="rounded-[2rem]"
      toolbar={
        <p className="text-xs text-secondary-text">
          {t('admin.faqs.showing', {
            showing: formatDashboardNumber(showingCount, locale),
            total: formatDashboardNumber(totalCount, locale),
          })}
        </p>
      }
      footer={
        totalPages > 1 ? (
          <div
            className="flex items-center justify-end gap-2"
            aria-label={t('admin.faqs.paginationAria')}
          >
            <button
              type="button"
              disabled={!canGoPrev || loading}
              onClick={() => onPageChange(currentPage - 1)}
              className={cn(
                'rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/50',
                'disabled:cursor-not-allowed disabled:opacity-40',
                focusRingClasses,
              )}
            >
              {t('admin.faqs.prev')}
            </button>
            <span className="px-2 text-xs tabular-nums text-secondary-text">
              {t('admin.faqs.pageOf', {
                page: currentPage,
                total: totalPages,
              })}
            </span>
            <button
              type="button"
              disabled={!canGoNext || loading}
              onClick={() => onPageChange(currentPage + 1)}
              className={cn(
                'rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white',
                'disabled:cursor-not-allowed disabled:opacity-40',
                focusRingClasses,
              )}
            >
              {t('admin.faqs.next')}
            </button>
          </div>
        ) : undefined
      }
    />
  )
}
