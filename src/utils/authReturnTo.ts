// src/utils/authReturnTo.ts
import { LOGIN_PATH, PAYMENT_PATH } from '../config/routes'
import { STORAGE_KEYS } from '../config/storage'

/**
 * Where to send a shopper after they sign in. Stored in sessionStorage so it
 * survives login → register hops and full-page OAuth redirects.
 */
export function rememberReturnTo(path: string) {
  try {
    sessionStorage.setItem(STORAGE_KEYS.authReturnTo, path)
  } catch {
    // Storage blocked — login still works, it just lands on the default page.
  }
}

export function peekReturnTo(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.authReturnTo)
  } catch {
    return null
  }
}

export function consumeReturnTo(): string | null {
  const value = peekReturnTo()
  try {
    sessionStorage.removeItem(STORAGE_KEYS.authReturnTo)
  } catch {
    // ignore
  }
  return value
}

type NavigateFn = (to: string, options?: { state?: unknown; replace?: boolean }) => void

/**
 * Go to checkout; guests are sent to sign in first and returned to checkout after.
 * Their localStorage cart is merged into the account on login (CartContext).
 */
export function goToCheckout(navigate: NavigateFn, isAuthenticated: boolean) {
  if (isAuthenticated) {
    navigate(PAYMENT_PATH)
    return
  }
  rememberReturnTo(PAYMENT_PATH)
  navigate(LOGIN_PATH, { state: { from: PAYMENT_PATH, reason: 'checkout' } })
}
