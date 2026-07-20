// src/types/adminDashboard.ts
export type RevenueInterval = 'daily' | 'weekly'

export interface DashboardKpiMetric {
  value: number
  trend: number
}

export interface DashboardAbandonedCartKpi extends DashboardKpiMetric {
  activeCarts: number
  previousActiveCarts: number
}

export interface DashboardKpis {
  totalRevenue: DashboardKpiMetric
  orders: DashboardKpiMetric
  conversionRate: DashboardKpiMetric
  abandonedCart: DashboardAbandonedCartKpi
  periodDays: number
}

export interface DashboardCustomerSegments {
  returningPercent: number
  loyalPatients: number
  newClients: number
  totalCustomersWithOrders: number
}

export interface DashboardTopProduct {
  id: string
  name: string
  image: string | null
  unitsSold: number
  price: number
}

export interface DashboardLowStockItem {
  id: string
  name: string
  stock: number
  stockLevel: number
  isCritical: boolean
}

export type DashboardOrderStatusBadge =
  | 'PAID'
  | 'REFUNDED'
  | 'PROCESSING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'PENDING'

export interface DashboardRecentOrder {
  id: string
  customerName: string
  totalAmount: number
  status: DashboardOrderStatusBadge
  createdAt: string
}

export interface DashboardOverviewData {
  greeting: {
    firstName: string
  }
  kpis: DashboardKpis
  customerSegments: DashboardCustomerSegments
  topProducts: DashboardTopProduct[]
  lowStock: DashboardLowStockItem[]
  recentOrders: DashboardRecentOrder[]
}

export interface DashboardRevenuePoint {
  date: string
  revenue: number
  orders: number
}

export interface DashboardRevenueChartData {
  interval: RevenueInterval
  periodDays: number
  points: DashboardRevenuePoint[]
}

export interface DashboardOverviewParams {
  period?: number
  limit?: number
  lowStockThreshold?: number
}

export interface DashboardRevenueParams {
  period?: number
  interval?: RevenueInterval
}
