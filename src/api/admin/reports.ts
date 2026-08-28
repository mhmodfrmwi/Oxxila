// src/api/admin/reports.ts
import { API_BASE_URL } from '../../config/api'
import { apiRequest, getAccessToken, ApiError } from '../../lib/api'
import type {
  ProductSalesListParams,
  ProductSalesReportData,
  SingleProductSalesParams,
  SingleProductSalesReportData,
} from '../../types/adminReports'

function toQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

/** GET /api/v1/reports/product-sales */
export function getProductSalesReport(
  params: ProductSalesListParams = {},
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ProductSalesReportData>(
    `/reports/product-sales${toQuery({
      period: params.period,
      startDate: params.startDate,
      endDate: params.endDate,
      page: params.page,
      limit: params.limit,
      sort: params.sort,
      search: params.search,
      category: params.category,
      brand: params.brand,
    })}`,
    { auth: true, signal: options?.signal },
  )
}

/** GET /api/v1/reports/product-sales/:productId */
export function getSingleProductSalesReport(
  productId: string,
  params: SingleProductSalesParams = {},
  options?: { signal?: AbortSignal },
) {
  return apiRequest<SingleProductSalesReportData>(
    `/reports/product-sales/${encodeURIComponent(productId)}${toQuery({
      period: params.period,
      startDate: params.startDate,
      endDate: params.endDate,
      interval: params.interval,
    })}`,
    { auth: true, signal: options?.signal },
  )
}

function buildExportQuery(
  params: ProductSalesListParams | SingleProductSalesParams,
): string {
  return toQuery({
    period: params.period,
    startDate: params.startDate,
    endDate: params.endDate,
    sort: 'sort' in params ? params.sort : undefined,
    search: 'search' in params ? params.search : undefined,
    category: 'category' in params ? params.category : undefined,
    brand: 'brand' in params ? params.brand : undefined,
    interval: 'interval' in params ? params.interval : undefined,
  })
}

/** Download CSV export for all product sales. */
export async function downloadProductSalesCsv(
  params: ProductSalesListParams = {},
): Promise<void> {
  const token = getAccessToken()
  if (!token) throw new ApiError('You are not logged in. Please log in to continue.', 401)

  const response = await fetch(
    `${API_BASE_URL}/reports/product-sales/export${buildExportQuery(params)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )

  if (!response.ok) {
    throw new ApiError('Unable to export product sales report.', response.status)
  }

  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition') ?? ''
  const match = disposition.match(/filename="([^"]+)"/)
  const filename = match?.[1] ?? 'product-sales.csv'
  triggerBlobDownload(blob, filename)
}

/** Download CSV export for a single product sales report. */
export async function downloadSingleProductSalesCsv(
  productId: string,
  params: SingleProductSalesParams = {},
): Promise<void> {
  const token = getAccessToken()
  if (!token) throw new ApiError('You are not logged in. Please log in to continue.', 401)

  const response = await fetch(
    `${API_BASE_URL}/reports/product-sales/${encodeURIComponent(productId)}/export${buildExportQuery(params)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )

  if (!response.ok) {
    throw new ApiError('Unable to export product sales report.', response.status)
  }

  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition') ?? ''
  const match = disposition.match(/filename="([^"]+)"/)
  const filename = match?.[1] ?? 'product-sales.csv'
  triggerBlobDownload(blob, filename)
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
