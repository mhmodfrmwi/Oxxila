// src/types/adminCartRecovery.ts

/**
 * Cart recovery metrics shape for a future API.
 * All values stay null until a backend endpoint exists — never invent numbers.
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
