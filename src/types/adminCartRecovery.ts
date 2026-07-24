// src/types/adminCartRecovery.ts

/** Raw response from GET /api/v1/payments/cart-recovery. */
export interface ApiCartRecovery {
  recoveredPercent: number
  totalAbandoned: number
  recoveredRevenue: number
  abandonedCarts?: number
  openSessions?: number
  recoveredOrders?: number
  periodDays?: number
}

/**
 * Cart recovery metrics shape used by the widget.
 * Values stay null when the API call fails — never invent numbers.
 */
export interface CartRecoveryMetrics {
  /** 0–100 recovery rate, or null when unavailable. */
  recoveryRatePercent: number | null
  abandonedRevenue: number | null
  recoveredRevenue: number | null
}

export const EMPTY_CART_RECOVERY_METRICS: CartRecoveryMetrics = {
  recoveryRatePercent: null,
  abandonedRevenue: null,
  recoveredRevenue: null,
}
