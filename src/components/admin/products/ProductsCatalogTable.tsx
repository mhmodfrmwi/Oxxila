// src/components/admin/products/ProductsCatalogTable.tsx
import { ImageOff, Pencil, TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { AdminProductRow } from '../../../types/adminProducts'
import {
  categoryBadgeTone,
  formatAdminProductPrice,
  formatPerformancePercent,
} from '../../../utils/adminProductsFormat'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import { DataTable, type DataTableColumn } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatusBadge'
import { InventoryStatusCell } from './InventoryStatusCell'

interface ProductsCatalogTableProps {
  products: readonly AdminProductRow[]
  loading?: boolean
  emptyTitle: string
  emptyDescription?: string
  emptyAction?: ReactNode
  showingCount: number
  totalCount: number
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onEditProduct?: (productId: string) => void
  togglingBestSellerId?: string | null
  onToggleBestSeller?: (productId: string) => void
}

/** Best-seller switch — PATCH /products/:id/best-seller. */
function BestSellerSwitch({
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
        checked
          ? 'border-accent/40 bg-accent'
          : 'border-white/15 bg-white/15',
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

function ProductThumbnail({ src, name }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  useEffect(() => {
    setFailed(false)
  }, [src])

  return (
    <div className="admin-glass size-14 shrink-0 overflow-hidden rounded-2xl p-1">
      {showImage ? (
        <img
          src={src!}
          alt=""
          className="size-full rounded-[0.56rem] object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="flex size-full items-center justify-center rounded-[0.56rem] bg-white/5 text-white/25"
          aria-hidden
          title={name}
        >
          <ImageOff size={14} strokeWidth={1.5} />
        </div>
      )}
    </div>
  )
}

export function ProductsCatalogTable({
  products,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
  showingCount,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onEditProduct,
  togglingBestSellerId = null,
  onToggleBestSeller,
}: ProductsCatalogTableProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  const columns = useMemo<DataTableColumn<AdminProductRow>[]>(
    () => [
      {
        id: 'details',
        header: t('admin.products.columns.details'),
        cell: (row) => (
          <div className="flex min-w-[11.2rem] max-w-[17.6rem] items-center gap-4">
            <ProductThumbnail src={row.image} name={row.name} />
            <div className="min-w-0">
              <p
                className="truncate text-sm font-bold text-primary-text"
                title={row.name}
              >
                {row.name}
              </p>
              <p className="mt-0.5 text-[8px] uppercase tracking-[0.08em] text-white/30">
                {row.sku
                  ? t('admin.products.sku', { sku: row.sku })
                  : t('admin.products.skuUnavailable')}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: 'category',
        header: t('admin.products.columns.category'),
        cell: (row) =>
          row.categoryName ? (
            <StatusBadge
              tone={categoryBadgeTone(row.categoryId)}
              className="max-w-[8rem] truncate"
              title={row.categoryName}
            >
              {row.categoryName}
            </StatusBadge>
          ) : (
            <span className="text-sm text-secondary-text" aria-label={t('admin.products.unavailable')}>
              —
            </span>
          ),
      },
      {
        id: 'inventory',
        header: t('admin.products.columns.inventory'),
        cell: (row) => (
          <InventoryStatusCell
            status={row.inventoryStatus}
            stock={row.stock}
            progress={row.inventoryProgress}
          />
        ),
      },
      {
        id: 'price',
        header: t('admin.products.columns.price'),
        cell: (row) => (
          <span className="font-[family-name:var(--admin-font-display)] text-lg text-primary-text tabular-nums">
            {formatAdminProductPrice(row.price, locale)}
          </span>
        ),
      },
      {
        id: 'bestSeller',
        header: t('admin.products.columns.bestSeller'),
        cell: (row) => {
          const busy = togglingBestSellerId === row.id
          return (
            <div className="flex items-center gap-2">
              <BestSellerSwitch
                checked={row.isBestSeller}
                disabled={busy || loading}
                label={
                  row.isBestSeller
                    ? t('admin.products.bestSeller.toggleOffAria', { name: row.name })
                    : t('admin.products.bestSeller.toggleOnAria', { name: row.name })
                }
                onToggle={() => onToggleBestSeller?.(row.id)}
              />
              <StatusBadge tone={row.isBestSeller ? 'accent' : 'neutral'}>
                {row.isBestSeller
                  ? t('admin.products.bestSeller.on')
                  : t('admin.products.bestSeller.off')}
              </StatusBadge>
            </div>
          )
        },
      },
      {
        id: 'performance',
        header: t('admin.products.columns.performance'),
        cell: (row) => {
          const label = formatPerformancePercent(row.performancePercent, locale)
          if (label == null || row.performancePercent == null) {
            return (
              <span className="text-sm text-secondary-text">
                {t('admin.products.unavailable')}
              </span>
            )
          }
          const positive = row.performancePercent > 0
          const negative = row.performancePercent < 0
          return (
            <div
              className={cn(
                'inline-flex items-center gap-2 text-xs font-bold',
                positive && 'text-support-success',
                negative && 'text-support-error',
                !positive && !negative && 'text-secondary-text',
              )}
            >
              <span>{label}</span>
              {positive ? (
                <TrendingUp size={10} aria-hidden />
              ) : negative ? (
                <TrendingDown size={10} aria-hidden />
              ) : null}
            </div>
          )
        },
      },
      {
        id: 'actions',
        header: t('admin.products.columns.actions'),
        headerClassName: 'text-end',
        className: 'text-end',
        cell: (row) => (
          <button
            type="button"
            className={cn(
              'inline-flex rounded-xl border border-white/5 bg-white/5 p-2.5 text-secondary-text',
              'transition-colors hover:bg-white/10 hover:text-primary-text',
              focusRingClasses,
            )}
            aria-label={t('admin.products.editAria', { name: row.name })}
            onClick={() => onEditProduct?.(row.id)}
          >
            <Pencil size={13} aria-hidden />
          </button>
        ),
      },
    ],
    [loading, locale, onEditProduct, onToggleBestSeller, t, togglingBestSellerId],
  )

  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages && totalPages > 1

  return (
    <DataTable
      columns={columns}
      rows={products}
      getRowId={(row) => row.id}
      loading={loading}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyAction={emptyAction}
      aria-label={t('admin.products.tableAria')}
      density="spacious"
      className="rounded-[var(--admin-radius-xl)]"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="text-[8px] font-bold uppercase tracking-[0.08em] text-white/30"
            aria-live="polite"
          >
            {t('admin.products.showing', {
              showing: showingCount,
              total: totalCount,
            })}
          </p>
          <div className="flex items-center gap-2" role="group" aria-label={t('admin.products.paginationAria')}>
            <button
              type="button"
              disabled={!canGoPrev || loading}
              onClick={() => onPageChange(currentPage - 1)}
              className={cn(
                'rounded-lg border border-border-subtle bg-white/5 px-4 py-2',
                'text-[8px] font-bold uppercase tracking-[0.08em] text-white/30',
                'transition-colors enabled:hover:bg-white/10 enabled:hover:text-primary-text',
                'disabled:pointer-events-none disabled:opacity-50',
                focusRingClasses,
              )}
            >
              {t('admin.products.prev')}
            </button>
            <button
              type="button"
              disabled={!canGoNext || loading}
              onClick={() => onPageChange(currentPage + 1)}
              className={cn(
                'rounded-lg border border-accent/30 bg-accent/20 px-4 py-2',
                'text-[8px] font-bold uppercase tracking-[0.08em] text-accent',
                'transition-colors enabled:hover:bg-accent/30',
                'disabled:pointer-events-none disabled:opacity-50',
                focusRingClasses,
              )}
            >
              {t('admin.products.next')}
            </button>
          </div>
        </div>
      }
    />
  )
}
