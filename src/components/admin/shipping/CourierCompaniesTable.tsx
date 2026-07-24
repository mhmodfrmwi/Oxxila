// src/components/admin/shipping/CourierCompaniesTable.tsx
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { AdminCarrierRow } from '../../../types/adminShipping'
import {
  carrierInitials,
  carrierStatusBadgeTone,
} from '../../../utils/adminShippingFormat'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import { DataTable, type DataTableColumn } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatusBadge'

interface CourierCompaniesTableProps {
  carriers: readonly AdminCarrierRow[]
  loading?: boolean
  emptyTitle: string
  emptyDescription?: string
  emptyAction?: ReactNode
  deletingId?: string | null
  onAdd: () => void
  onEdit: (carrier: AdminCarrierRow) => void
  onDelete: (carrier: AdminCarrierRow) => void
}

function CompanyCell({
  name,
  code,
  logo,
}: {
  name: string
  code: string
  logo: string | null
}) {
  const initials = carrierInitials(code !== '—' ? code : name).slice(0, 3)

  return (
    <div className="flex min-w-[8rem] items-center gap-3">
      {logo ? (
        <img
          src={logo}
          alt=""
          className="size-8 shrink-0 rounded-lg border border-white/10 bg-white/5 object-contain p-0.5"
        />
      ) : (
        <span
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[8px] font-bold text-[#a394ff]"
          aria-hidden
        >
          {initials}
        </span>
      )}
      <span className="truncate text-sm font-bold text-white" title={name}>
        {name}
      </span>
    </div>
  )
}

export function CourierCompaniesTable({
  carriers,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
  deletingId = null,
  onAdd,
  onEdit,
  onDelete,
}: CourierCompaniesTableProps) {
  const { t } = useTranslation()

  const columns = useMemo<DataTableColumn<AdminCarrierRow>[]>(
    () => [
      {
        id: 'company',
        header: t('admin.shipping.carriers.columns.company'),
        cell: (row) => (
          <CompanyCell name={row.name} code={row.code} logo={row.logo} />
        ),
      },
      {
        id: 'type',
        header: t('admin.shipping.carriers.columns.type'),
        headerClassName: 'text-center',
        className: 'text-center',
        cell: (row) => (
          <StatusBadge
            tone="accent"
            className="border border-current/20 text-[7.2px] font-black tracking-tight"
          >
            {t(`admin.shipping.method.types.${row.type}.label`)}
          </StatusBadge>
        ),
      },
      {
        id: 'deliveryTime',
        header: t('admin.shipping.carriers.columns.deliveryTime'),
        headerClassName: 'text-center',
        className: 'text-center',
        cell: (row) => (
          <span className="text-sm text-white/60">
            {row.type === 'api'
              ? t('admin.shipping.carriers.bosta')
              : row.deliveryDays ?? '—'}
          </span>
        ),
      },
      {
        id: 'coverage',
        header: t('admin.shipping.carriers.columns.coverage'),
        headerClassName: 'text-center',
        className: 'text-center',
        cell: (row) => (
          <span
            className="line-clamp-2 text-xs text-white/40"
            title={row.coverageLabel}
          >
            {row.coverageLabel}
          </span>
        ),
      },
      {
        id: 'status',
        header: t('admin.shipping.carriers.columns.status'),
        headerClassName: 'text-center',
        className: 'text-center',
        cell: (row) => (
          <StatusBadge
            tone={carrierStatusBadgeTone(row.isActive)}
            className="border border-current/20 text-[7.2px] font-black tracking-tight"
          >
            {row.isActive
              ? t('admin.shipping.carriers.active')
              : t('admin.shipping.carriers.inactive')}
          </StatusBadge>
        ),
      },
      {
        id: 'actions',
        header: t('admin.shipping.carriers.columns.action'),
        headerClassName: 'text-end',
        className: 'text-end',
        cell: (row) => (
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(row)}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-lg',
                'text-white/50 transition-colors hover:bg-white/10 hover:text-white',
                focusRingClasses,
              )}
              aria-label={t('admin.shipping.carriers.editAria', { name: row.name })}
            >
              <Pencil size={13} aria-hidden />
            </button>
            <button
              type="button"
              disabled={deletingId === row.id}
              onClick={() => onDelete(row)}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-lg',
                'text-white/50 transition-colors hover:bg-support-error/10 hover:text-support-error',
                'disabled:cursor-not-allowed disabled:opacity-50',
                focusRingClasses,
              )}
              aria-label={t('admin.shipping.carriers.deleteAria', { name: row.name })}
            >
              {deletingId === row.id ? (
                <Loader2 size={13} className="animate-spin" aria-hidden />
              ) : (
                <Trash2 size={13} aria-hidden />
              )}
            </button>
          </div>
        ),
      },
    ],
    [deletingId, onDelete, onEdit, t],
  )

  return (
    <DataTable
      columns={columns}
      rows={carriers}
      getRowId={(row) => row.id}
      loading={loading}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyAction={emptyAction}
      aria-label={t('admin.shipping.carriers.tableAria')}
      className="rounded-[1.6rem]"
      toolbar={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-[family-name:var(--admin-font-display)] text-xl font-normal text-white">
            {t('admin.shipping.carriers.title')}
          </h3>
          <button
            type="button"
            onClick={onAdd}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl border border-[#a394ff]/20',
              'bg-[rgba(163,148,255,0.1)] px-5 py-2.5',
              'text-xs font-bold uppercase tracking-[0.1em] text-[#a394ff]',
              'transition-colors hover:bg-[rgba(163,148,255,0.18)]',
              focusRingClasses,
            )}
          >
            <Plus size={13} aria-hidden />
            {t('admin.shipping.carriers.addCompany')}
          </button>
        </div>
      }
    />
  )
}
