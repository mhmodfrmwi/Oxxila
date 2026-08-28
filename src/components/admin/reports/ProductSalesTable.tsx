// src/components/admin/reports/ProductSalesTable.tsx
import { ImageOff } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ProductSalesRow } from '../../../types/adminReports'
import {
  formatDashboardMoney,
  formatDashboardNumber,
} from '../../../utils/adminDashboardFormat'
import { resolveProductImageUrl } from '../../../utils/productImage'
import { cn } from '../../../lib/cn'
import { DataTable, type DataTableColumn } from '../ui/DataTable'

interface ProductSalesTableProps {
  rows: readonly ProductSalesRow[]
  loading?: boolean
  emptyTitle: string
  emptyDescription?: string
  showingCount: number
  totalCount: number
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onRowClick?: (productId: string) => void
}

export function ProductSalesTable({
  rows,
  loading = false,
  emptyTitle,
  emptyDescription,
  showingCount,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onRowClick,
}: ProductSalesTableProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  const columns = useMemo<DataTableColumn<ProductSalesRow>[]>(
    () => [
      {
        id: 'product',
        header: t('admin.reports.columns.product'),
        cell: (row) => {
          const imageUrl = resolveProductImageUrl(row.image)
          return (
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-2xl bg-white/5">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt=""
                    className="size-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-white/30">
                    <ImageOff size={18} aria-hidden />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-primary-text">{row.name}</p>
                {row.category?.name ? (
                  <p className="truncate text-xs text-secondary-text">{row.category.name}</p>
                ) : null}
              </div>
            </div>
          )
        },
      },
      {
        id: 'brand',
        header: t('admin.reports.columns.brand'),
        cell: (row) => (
          <span className="text-sm text-secondary-text">{row.brand?.name ?? '—'}</span>
        ),
      },
      {
        id: 'unitsSold',
        header: t('admin.reports.columns.unitsSold'),
        align: 'end',
        cell: (row) => (
          <span className="tabular-nums text-sm text-primary-text">
            {formatDashboardNumber(row.unitsSold, locale)}
          </span>
        ),
      },
      {
        id: 'grossRevenue',
        header: t('admin.reports.columns.grossRevenue'),
        align: 'end',
        cell: (row) => (
          <span className="tabular-nums text-sm font-medium text-primary-text">
            {formatDashboardMoney(row.grossRevenue, locale)}
          </span>
        ),
      },
      {
        id: 'orderCount',
        header: t('admin.reports.columns.orderCount'),
        align: 'end',
        cell: (row) => (
          <span className="tabular-nums text-sm text-secondary-text">
            {formatDashboardNumber(row.orderCount, locale)}
          </span>
        ),
      },
      {
        id: 'avgUnitPrice',
        header: t('admin.reports.columns.avgUnitPrice'),
        align: 'end',
        cell: (row) => (
          <span className="tabular-nums text-sm text-secondary-text">
            {formatDashboardMoney(row.avgUnitPrice, locale)}
          </span>
        ),
      },
    ],
    [locale, t],
  )

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowId={(row) => row.productId}
      loading={loading}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      density="spacious"
      onRowClick={onRowClick ? (row) => onRowClick(row.productId) : undefined}
      aria-label={t('admin.reports.tableAria')}
      footer={
        totalPages > 1 ? (
          <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-secondary-text">
              {t('admin.reports.showing', { showing: showingCount, total: totalCount })}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || loading}
                onClick={() => onPageChange(currentPage - 1)}
                className={cn(
                  'rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-secondary-text',
                  'transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                {t('admin.reports.prev')}
              </button>
              <span className="text-xs tabular-nums text-secondary-text">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages || loading}
                onClick={() => onPageChange(currentPage + 1)}
                className={cn(
                  'rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-secondary-text',
                  'transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                {t('admin.reports.next')}
              </button>
            </div>
          </div>
        ) : (
          <div className="border-t border-white/10 px-4 py-4">
            <p className="text-xs text-secondary-text">
              {t('admin.reports.showing', { showing: showingCount, total: totalCount })}
            </p>
          </div>
        )
      }
    />
  )
}
