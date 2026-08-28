// src/types/adminReports.ts

export type ProductSalesSort =
  | '-grossRevenue'
  | 'grossRevenue'
  | '-unitsSold'
  | 'unitsSold'
  | 'name'
  | '-name'

export type ReportInterval = 'daily' | 'weekly'

export type ReportPeriodPreset = 7 | 30 | 90

export interface ReportEntityRef {
  id: string
  name: string | null
}

export interface ProductSalesRow {
  productId: string
  name: string
  image: string | null
  category: ReportEntityRef | null
  brand: ReportEntityRef | null
  unitsSold: number
  grossRevenue: number
  orderCount: number
  avgUnitPrice: number
}

export interface ProductSalesSummary {
  totalRevenue: number
  totalUnits: number
  orderCount: number
  productCount?: number
  avgUnitPrice?: number
}

export interface ReportPeriod {
  start: string
  end: string
  days: number
}

export interface ProductSalesReportData {
  summary: ProductSalesSummary
  period: ReportPeriod
  rows: ProductSalesRow[]
}

export interface ProductSalesTimeseriesPoint {
  date: string
  revenue: number
  units: number
  orders: number
}

export interface ProductSalesRecentOrder {
  orderId: string
  createdAt: string
  quantity: number
  lineRevenue: number
}

export interface ProductSalesProductHeader {
  productId: string
  name: string
  image: string | null
  price: number
  category: ReportEntityRef | null
  brand: ReportEntityRef | null
}

export interface SingleProductSalesReportData {
  product: ProductSalesProductHeader
  summary: ProductSalesSummary
  period: ReportPeriod
  timeseries: ProductSalesTimeseriesPoint[]
  recentOrders: ProductSalesRecentOrder[]
  interval: ReportInterval
}

export interface ProductSalesListParams {
  period?: number
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  sort?: ProductSalesSort
  search?: string
  category?: string
  brand?: string
}

export interface SingleProductSalesParams {
  period?: number
  startDate?: string
  endDate?: string
  interval?: ReportInterval
}
