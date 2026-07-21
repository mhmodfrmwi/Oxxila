// src/api/admin/cartRecovery.ts
import type { CartRecoveryMetrics } from '../../types/adminCartRecovery'

/**
 * Cart recovery metrics.
 * No dedicated backend endpoint yet — returns null so the UI shows placeholders.
 * Swap this for a real `apiRequest` when the API ships; keep the return type.
 */
export async function getCartRecoveryMetrics(_options?: {
  signal?: AbortSignal
}): Promise<CartRecoveryMetrics | null> {
  return null
}
