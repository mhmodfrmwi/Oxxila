// src/types/adminCustomers.ts

/** Segment tabs — only All / Inactive are API-backed. */
export type AdminCustomersSegmentTab = 'all' | 'inactive'

export interface AdminCustomerStatsKpi {
  value: number
  trend: number | null
  trendLabel: string | null
  newThisMonth?: number | null
}

export interface AdminCustomerStats {
  totalCustomers: AdminCustomerStatsKpi
  averageLtv: AdminCustomerStatsKpi
}

export interface ApiAdminCustomerStats {
  totalCustomers?: {
    value?: number
    newThisMonth?: number
    trendLabel?: string
    trend?: number
  }
  averageLtv?: {
    value?: number
    trend?: number
    trendLabel?: string
  }
}

export interface AdminCustomerRow {
  id: string
  name: string
  email: string
  phone: string | null
  avatar: string | null
  initials: string
  active: boolean
  role: string
  createdAt: string
  ordersCount: number | null
  /** totalPaid / totalSpend from API */
  totalSpend: number | null
  lastOrderAt: string | null
}

/** Raw user from GET /api/v1/users (admin). */
export interface ApiAdminCustomer {
  _id: string
  name?: string
  email?: string
  phone?: string
  avatar?: string
  role?: string
  active?: boolean
  storeCreditBalance?: number
  createdAt?: string
  updatedAt?: string
  addresses?: ApiAdminCustomerAddress[]
  orders?: number
  totalPaid?: number
  totalSpend?: number
  lastOrder?: string | null
}

export interface ApiAdminCustomerAddress {
  _id?: string
  label?: string
  governorate?: { id?: string; name?: string }
  district?: { id?: string; name?: string } | null
  addressLine?: string
  isOther?: boolean
  isDefault?: boolean
}

/** Normalized detail model for the customer details drawer. */
export interface AdminCustomerDetail {
  id: string
  name: string
  email: string | null
  phone: string | null
  avatar: string | null
  initials: string
  active: boolean
  role: string
  storeCreditBalance: number
  createdAt: string | null
  addresses: AdminCustomerAddress[]
  ordersCount: number | null
  totalSpend: number | null
  lastOrderAt: string | null
}

export interface AdminCustomerAddress {
  id: string
  label: string | null
  line: string
  isDefault: boolean
}

export interface AdminCustomersListParams {
  page?: number
  limit?: number
  sort?: string
  keyword?: string
  /** Restrict to storefront customers. */
  role?: 'user' | 'admin'
  /** Account active flag (`active=true|false`). */
  active?: boolean
}

/** Fields accepted by POST /api/v1/users (customers always use role `user`). */
export interface AdminCustomerCreateFields {
  name: string
  email: string
  password: string
  phone?: string
  role: 'user'
  active?: boolean
}

/** Fields accepted by PUT /api/v1/users/:id (password/role stripped server-side). */
export interface AdminCustomerUpdateFields {
  name?: string
  email?: string
  phone?: string
  active?: boolean
}

export interface AdminCustomerFormValues {
  name: string
  email: string
  phone: string
  password: string
  active: boolean
}

export type AdminCustomerFormErrors = Partial<
  Record<keyof AdminCustomerFormValues, string>
>
