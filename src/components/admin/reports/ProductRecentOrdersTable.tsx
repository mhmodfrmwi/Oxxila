// src/components/admin/reports/ProductRecentOrdersTable.tsx
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ProductSalesRecentOrder } from '../../../types/adminReports'
import { formatAdminOrderNumber } from '../../../utils/adminOrdersFormat'
import {
  formatDashboardMoney,
  formatDashboardNumber,
} from '../../../utils/adminDashboardFormat'
import { DataTable, type DataTableColumn } from '../ui/DataTable'

interface ProductRecentOrdersTableProps {
  orders: readonly ProductSalesRecentOrder[]
  loading?: boolean
}

export function ProductRecentOrdersTable({
  orders,
  loading = false,
}: ProductRecentOrdersTableProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  const columns = useMemo<DataTableColumn<ProductSalesRecentOrder>[]>(
    () => [
      {
        id: 'orderId',
        header: t('admin.reports.detail.columns.order'),
        cell: (row) => (
          <span className="font-mono text-sm text-primary-text">
            {formatAdminOrderNumber(row.orderId)}
          </span>
        ),
      },
      {
        id: 'createdAt',
        header: t('admin.reports.detail.columns.date'),
        cell: (row) => (
          <span className="text-sm text-secondary-text">
            {new Date(row.createdAt).toLocaleDateString(locale, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        ),
      },
      {
        id: 'quantity',
        header: t('admin.reports.detail.columns.quantity'),
        align: 'end',
        cell: (row) => (
          <span className="tabular-nums text-sm text-primary-text">
            {formatDashboardNumber(row.quantity, locale)}
          </span>
        ),
      },
      {
        id: 'lineRevenue',
        header: t('admin.reports.detail.columns.lineRevenue'),
        align: 'end',
        cell: (row) => (
          <span className="tabular-nums text-sm font-medium text-primary-text">
            {formatDashboardMoney(row.lineRevenue, locale)}
          </span>
        ),
      },
    ],
    [locale, t],
  )

  return (
    <DataTable
      columns={columns}
      rows={orders}
      getRowId={(row) => row.orderId}
      loading={loading}
      emptyTitle={t('admin.reports.detail.ordersEmptyTitle')}
      emptyDescription={t('admin.reports.detail.ordersEmptyDescription')}
      aria-label={t('admin.reports.detail.ordersTableAria')}
    />
  )
}
