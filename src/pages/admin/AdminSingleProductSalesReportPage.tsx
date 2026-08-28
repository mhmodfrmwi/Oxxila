// src/pages/admin/AdminSingleProductSalesReportPage.tsx
import { ArrowLeft, Download } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { downloadSingleProductSalesCsv } from '../../api/admin/reports'
import { ProductRecentOrdersTable } from '../../components/admin/reports/ProductRecentOrdersTable'
import { ProductSalesChartCard } from '../../components/admin/reports/ProductSalesChartCard'
import { ProductSalesHeaderCard } from '../../components/admin/reports/ProductSalesHeaderCard'
import { ProductSalesKpiRow } from '../../components/admin/reports/ProductSalesKpiRow'
import { ReportsFilterCard } from '../../components/admin/reports/ReportsFilterCard'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { AdminButton } from '../../components/admin/ui/AdminButton'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { ADMIN_REPORTS_PATH } from '../../config/routes'
import { useAdminSingleProductSalesReport } from '../../hooks/useAdminSingleProductSalesReport'
import { ApiError } from '../../lib/api'

export function AdminSingleProductSalesReportPage() {
  const { t } = useTranslation()
  const { productId } = useParams<{ productId: string }>()
  const report = useAdminSingleProductSalesReport(productId)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const failed = Boolean(report.error) && !report.loading && !report.data
  const staleError = Boolean(report.error) && Boolean(report.data)

  async function handleExport() {
    if (!productId) return
    setExportError(null)
    setExporting(true)
    try {
      await downloadSingleProductSalesCsv(productId, report.queryParams)
    } catch (error) {
      setExportError(
        error instanceof ApiError ? error.message : t('admin.reports.exportFailed'),
      )
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <Link
        to={ADMIN_REPORTS_PATH}
        className="mb-2 inline-flex items-center gap-2 text-sm text-accent hover:text-accent-soft"
      >
        <ArrowLeft size={16} aria-hidden />
        {t('admin.reports.detail.backToReports')}
      </Link>

      <AdminPageHeader
        title={report.product?.name ?? t('admin.reports.detail.title')}
        subtitle={t('admin.reports.detail.subtitle')}
        actions={
          <AdminButton
            type="button"
            variant="outline"
            disabled={exporting || report.loading || !productId}
            onClick={() => void handleExport()}
          >
            <Download size={16} aria-hidden />
            {exporting ? t('admin.reports.exporting') : t('admin.reports.exportCsv')}
          </AdminButton>
        }
      />

      {exportError ? (
        <p
          className="mb-4 rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
          role="alert"
        >
          {exportError}
        </p>
      ) : null}

      <div className="flex flex-col gap-[var(--admin-content-gap-tight)]">
        <ProductSalesHeaderCard product={report.product} loading={report.loading} />

        <ReportsFilterCard
          reportPeriod={report.period}
          period={report.filters.period}
          dateFrom={report.filters.dateFrom}
          dateTo={report.filters.dateTo}
          onPeriodChange={report.setPeriod}
          onDateFromChange={report.setDateFrom}
          onDateToChange={report.setDateTo}
          disabled={report.loading && !report.data}
          showSearch={false}
        />

        {failed ? (
          <EmptyState
            title={t('admin.reports.loadErrorTitle')}
            description={report.error ?? t('admin.reports.loadErrorDescription')}
            action={
              <AdminButton type="button" variant="outline" onClick={report.reload}>
                {t('admin.reports.retry')}
              </AdminButton>
            }
          />
        ) : (
          <>
            {staleError ? (
              <p
                className="rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
                role="alert"
              >
                {report.error}
              </p>
            ) : null}

            <ProductSalesKpiRow
              summary={report.summary}
              loading={report.loading}
              variant="detail"
            />

            <ProductSalesChartCard
              points={report.timeseries}
              interval={report.filters.interval}
              loading={report.loading}
              onIntervalChange={report.setInterval}
            />

            <section aria-labelledby="product-orders-heading">
              <div className="mb-3">
                <h2 id="product-orders-heading" className="text-sm font-semibold text-primary-text">
                  {t('admin.reports.detail.ordersSectionTitle')}
                </h2>
                <p className="mt-0.5 text-xs text-secondary-text">
                  {t('admin.reports.detail.ordersSectionSubtitle')}
                </p>
              </div>
              <ProductRecentOrdersTable orders={report.recentOrders} loading={report.loading} />
            </section>
          </>
        )}
      </div>
    </>
  )
}
