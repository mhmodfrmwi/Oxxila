// src/types/adminCustomers.ts

/** Segment tabs from Figma Customer Intelligence. */
export type AdminCustomersSegmentTab =
  | 'all'
  | 'vip'
  | 'frequent'
  | 'inactive'

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
  /** Not provided by GET /users — UI shows em dash. */
  ordersCount: number | null
  /** Not provided by GET /users — UI shows em dash. */
  ltv: number | null
  /** Not provided by GET /users — UI shows em dash. */
  lastVisitAt: string | null
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
  createdAt?: string
  updatedAt?: string
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
