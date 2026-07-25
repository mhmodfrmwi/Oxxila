// src/components/admin/categories/CategoriesCatalogTable.tsx
import { ImageOff, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import type { AdminCategoryRow } from '../../../types/adminCategories'
import { formatDashboardNumber } from '../../../utils/adminDashboardFormat'
import { focusRingClasses } from '../../ui/interactionStyles'
import { DataTable, type DataTableColumn } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatusBadge'

interface CategoriesCatalogTableProps {
  categories: readonly AdminCategoryRow[]
  loading?: boolean
  emptyTitle: string
  emptyDescription?: string
  emptyAction?: ReactNode
  showingCount: number
  totalCount: number
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  togglingCategoryId?: string | null
  deletingCategoryId?: string | null
  onEditCategory?: (category: AdminCategoryRow) => void
  onDeleteCategory?: (category: AdminCategoryRow) => void
  onToggleActive?: (categoryId: string) => void
}

function CategoryThumbnail({
  src,
  name,
}: {
  src: string | null
  name: string
}) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  useEffect(() => {
    setFailed(false)
  }, [src])

  return (
    <div className="flex min-w-[11.2rem] max-w-[17.6rem] items-center gap-4">
      {showImage ? (
        <img
          src={src!}
          alt=""
          className="size-10 shrink-0 rounded-lg border border-white/10 object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/30"
          aria-hidden
        >
          <ImageOff size={14} />
        </span>
      )}
      <p className="truncate text-sm font-bold text-primary-text" title={name}>
        {name}
      </p>
    </div>
  )
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

export function CategoriesCatalogTable({
  categories,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
  showingCount,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  togglingCategoryId = null,
  deletingCategoryId = null,
  onEditCategory,
  onDeleteCategory,
  onToggleActive,
}: CategoriesCatalogTableProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages && totalPages > 1

  const columns = useMemo<DataTableColumn<AdminCategoryRow>[]>(
    () => [
      {
        id: 'details',
        header: t('admin.categories.columns.name'),
        cell: (row) => <CategoryThumbnail src={row.image} name={row.name} />,
      },
      {
        id: 'slug',
        header: t('admin.categories.columns.slug'),
        cell: (row) => (
          <span className="font-mono text-xs text-secondary-text">{row.slug}</span>
        ),
      },
      {
        id: 'subcategories',
        header: t('admin.categories.columns.subcategories'),
        cell: (row) => (
          <span className="text-sm tabular-nums text-primary-text">
            {formatDashboardNumber(row.subcategoryCount, locale)}
          </span>
        ),
      },
      {
        id: 'status',
        header: t('admin.categories.columns.status'),
        cell: (row) => {
          const busy = togglingCategoryId === row.id
          return (
            <div className="flex items-center gap-2">
              <ActiveSwitch
                checked={row.isActive}
                disabled={busy || loading}
                label={
                  row.isActive
                    ? t('admin.categories.toggle.offAria', { name: row.name })
                    : t('admin.categories.toggle.onAria', { name: row.name })
                }
                onToggle={() => onToggleActive?.(row.id)}
              />
              <StatusBadge tone={row.isActive ? 'success' : 'neutral'}>
                {row.isActive
                  ? t('admin.categories.active')
                  : t('admin.categories.inactive')}
              </StatusBadge>
            </div>
          )
        },
      },
      {
        id: 'actions',
        header: t('admin.categories.columns.actions'),
        headerClassName: 'text-end',
        className: 'text-end',
        cell: (row) => (
          <div className="inline-flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onEditCategory?.(row)}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-lg text-white/50',
                'transition-colors hover:bg-white/10 hover:text-white',
                focusRingClasses,
              )}
              aria-label={t('admin.categories.editAria', { name: row.name })}
            >
              <Pencil size={13} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => onDeleteCategory?.(row)}
              disabled={deletingCategoryId === row.id}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-lg text-white/50',
                'transition-colors hover:bg-support-error/10 hover:text-support-error',
                'disabled:pointer-events-none disabled:opacity-40',
                focusRingClasses,
              )}
              aria-label={t('admin.categories.deleteAria', { name: row.name })}
            >
              <Trash2 size={13} aria-hidden />
            </button>
          </div>
        ),
      },
    ],
    [
      deletingCategoryId,
      loading,
      locale,
      onDeleteCategory,
      onEditCategory,
      onToggleActive,
      t,
      togglingCategoryId,
    ],
  )

  return (
    <DataTable
      columns={columns}
      rows={categories}
      getRowId={(row) => row.id}
      loading={loading}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyAction={emptyAction}
      aria-label={t('admin.categories.tableAria')}
      density="spacious"
      className="rounded-[2rem]"
      toolbar={
        <p className="text-xs text-secondary-text">
          {t('admin.categories.showing', {
            showing: formatDashboardNumber(showingCount, locale),
            total: formatDashboardNumber(totalCount, locale),
          })}
        </p>
      }
      footer={
        totalPages > 1 ? (
          <div
            className="flex items-center justify-end gap-2"
            aria-label={t('admin.categories.paginationAria')}
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
              {t('admin.categories.prev')}
            </button>
            <span className="px-2 text-xs tabular-nums text-secondary-text">
              {t('admin.categories.pageOf', {
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
              {t('admin.categories.next')}
            </button>
          </div>
        ) : undefined
      }
    />
  )
}
