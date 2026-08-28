// src/pages/admin/AdminProductSalesReportPage.tsx
import { Download } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { downloadProductSalesCsv } from '../../api/admin/reports'
import { ProductSalesKpiRow } from '../../components/admin/reports/ProductSalesKpiRow'
import { ProductSalesTable } from '../../components/admin/reports/ProductSalesTable'
import { ReportsFilterCard } from '../../components/admin/reports/ReportsFilterCard'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { AdminButton } from '../../components/admin/ui/AdminButton'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { adminReportProductPath } from '../../config/routes'
import { useAdminProductSalesReport } from '../../hooks/useAdminProductSalesReport'
import { ApiError } from '../../lib/api'

export function AdminProductSalesReportPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const report = useAdminProductSalesReport()
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const failed = Boolean(report.error) && !report.loading && report.rows.length === 0
  const staleError = Boolean(report.error) && report.rows.length > 0
  const currentPage = report.pagination?.currentPage ?? report.filters.page
  const totalPages = Math.max(report.pagination?.numberOfPages ?? 1, 1)
  const totalCount = report.pagination?.totalDocuments ?? report.rows.length
  const showingCount = report.rows.length

  const emptyTitle = report.hasActiveFilters
    ? t('admin.reports.emptyFilteredTitle')
    : t('admin.reports.emptyTitle')
  const emptyDescription = report.hasActiveFilters
    ? t('admin.reports.emptyFilteredDescription')
    : t('admin.reports.emptyDescription')

  async function handleExport() {
    setExportError(null)
    setExporting(true)
    try {
      await downloadProductSalesCsv(report.queryParams)
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
      <AdminPageHeader
        title={t('admin.reports.title')}
        subtitle={t('admin.reports.subtitle')}
        actions={
          <AdminButton
            type="button"
            variant="outline"
            disabled={exporting || report.loading}
            onClick={() => void handleExport()}
          >
            <Download size={16} aria-hidden />
            {exporting ? t('admin.reports.exporting') : t('admin.reports.exportCsv')}
          </AdminButton>
        }
      />

      {exportError ? (
        <p
          className="rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
          role="alert"
        >
          {exportError}
        </p>
      ) : null}

      <div className="flex flex-col gap-[var(--admin-content-gap-tight)]">
        <ProductSalesKpiRow summary={report.summary} loading={report.loading} />

        <ReportsFilterCard
          reportPeriod={report.period}
          period={report.filters.period}
          keyword={report.filters.keyword}
          dateFrom={report.filters.dateFrom}
          dateTo={report.filters.dateTo}
          onKeywordChange={report.setKeyword}
          onPeriodChange={report.setPeriod}
          onDateFromChange={report.setDateFrom}
          onDateToChange={report.setDateTo}
          disabled={report.loading && report.rows.length === 0}
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

            <section aria-labelledby="reports-table-heading">
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h2 id="reports-table-heading" className="text-sm font-semibold text-primary-text">
                    {t('admin.reports.tableTitle')}
                  </h2>
                  <p className="mt-0.5 text-xs text-secondary-text">
                    {t('admin.reports.tableSubtitle')}
                  </p>
                </div>
              </div>

              <ProductSalesTable
                rows={report.rows}
                loading={report.loading}
                emptyTitle={emptyTitle}
                emptyDescription={emptyDescription}
                showingCount={showingCount}
                totalCount={totalCount}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={report.setPage}
                onRowClick={(productId) => navigate(adminReportProductPath(productId))}
              />
            </section>
          </>
        )}
      </div>
    </>
  )
}
