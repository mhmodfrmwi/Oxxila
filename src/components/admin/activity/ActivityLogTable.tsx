// src/components/admin/activity/ActivityLogTable.tsx
import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { AdminActivityLogRow } from '../../../types/adminAudit'
import { formatAdminAuditDate } from '../../../utils/adminAuditFormat'
import { resolveActivityLogDisplayTab } from '../../../utils/adminActivityNavigation'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import { DataTable, type DataTableColumn } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatusBadge'
import { ActivityLogResourceLink } from './ActivityLogResourceLink'
import { AdminPersonCell } from '../ui/AdminPersonCell'

interface ActivityLogTableProps {
  logs: readonly AdminActivityLogRow[]
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

export function ActivityLogTable({
  logs,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
  showingCount,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
}: ActivityLogTableProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages

  const columns = useMemo<DataTableColumn<AdminActivityLogRow>[]>(
    () => [
      {
        id: 'when',
        header: t('admin.audit.table.when'),
        cell: (row) => (
          <span className="whitespace-nowrap text-xs text-white/60">
            {formatAdminAuditDate(row.createdAt, locale)}
          </span>
        ),
      },
      {
        id: 'actor',
        header: t('admin.audit.table.actor'),
        cell: (row) => (
          <AdminPersonCell
            name={row.actorName}
            email={row.actorEmail}
            initials={row.actorInitials}
          />
        ),
      },
      {
        id: 'action',
        header: t('admin.audit.table.action'),
        cell: (row) => (
          <StatusBadge tone="neutral" className="uppercase">
            {t(`admin.audit.actions.${row.action}`, { defaultValue: row.action })}
          </StatusBadge>
        ),
      },
      {
        id: 'tab',
        header: t('admin.audit.table.module'),
        cell: (row) => (
          <span className="text-sm text-white/70">
            {t(`admin.audit.tabs.${resolveActivityLogDisplayTab(row.tab)}`, {
              defaultValue: resolveActivityLogDisplayTab(row.tab),
            })}
          </span>
        ),
      },
      {
        id: 'resource',
        header: t('admin.audit.table.resource'),
        cell: (row) => (
          <ActivityLogResourceLink
            label={row.resourceLabel}
            href={row.href}
            subtitle={t(`admin.audit.resourceTypes.${row.resourceType}`, {
              defaultValue: row.resourceType,
            })}
          />
        ),
      },
      {
        id: 'summary',
        header: t('admin.audit.table.summary'),
        cell: (row) =>
          row.href ? (
            <Link
              to={row.href}
              className={cn(
                'block min-w-[18rem] max-w-[42rem] text-sm leading-6 text-white/70 transition-colors hover:text-accent',
                focusRingClasses,
              )}
            >
              {row.summary}
            </Link>
          ) : (
            <p className="min-w-[18rem] max-w-[42rem] text-sm leading-6 text-white/70">{row.summary}</p>
          ),
      },
    ],
    [locale, t],
  )

  return (
    <DataTable
      columns={columns}
      rows={logs}
      getRowId={(row) => row.id}
      loading={loading}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyAction={emptyAction}
      aria-label={t('admin.audit.tableAria')}
      className="rounded-[1.6rem]"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="text-[8px] font-bold uppercase tracking-[0.08em] text-white/30"
            aria-live="polite"
          >
            {t('admin.audit.showing', {
              showing: showingCount,
              total: totalCount,
            })}
          </p>
          <div
            className="flex items-center gap-2"
            role="group"
            aria-label={t('admin.audit.paginationAria')}
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
              {t('admin.audit.prev')}
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
              {t('admin.audit.next')}
            </button>
          </div>
        </div>
      }
    />
  )
}
