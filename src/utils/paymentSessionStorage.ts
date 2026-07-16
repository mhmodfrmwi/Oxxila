/** Matches backend checkout-test flow — survives Stripe redirect without `?session=` in URL. */
export const PAYMENT_SESSION_STORAGE_KEY = 'oxxila_payment_session'

function isAppPaymentSessionId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value)
}

function readStoredPaymentSessionId(): string {
  const fromSession = sessionStorage.getItem(PAYMENT_SESSION_STORAGE_KEY)?.trim() ?? ''
  if (isAppPaymentSessionId(fromSession)) return fromSession

  const fromLocal = localStorage.getItem(PAYMENT_SESSION_STORAGE_KEY)?.trim() ?? ''
  if (isAppPaymentSessionId(fromLocal)) return fromLocal

  return ''
}

export function storePaymentSessionId(sessionId: string) {
  const trimmed = String(sessionId ?? '').trim()
  if (!isAppPaymentSessionId(trimmed)) return

  sessionStorage.setItem(PAYMENT_SESSION_STORAGE_KEY, trimmed)
  localStorage.setItem(PAYMENT_SESSION_STORAGE_KEY, trimmed)
}

export function clearPaymentSessionId() {
  sessionStorage.removeItem(PAYMENT_SESSION_STORAGE_KEY)
  localStorage.removeItem(PAYMENT_SESSION_STORAGE_KEY)
}

/**
 * Resolve the app PaymentSession Mongo id after Stripe/Paymob redirect.
 *
 * Backend Stripe success_url is: `${STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`
 * That `session_id` is Stripe's cs_… id — NOT the id we poll with.
 * Backend checkout-test stores paymentSessionId in storage before redirect; we do the same.
 */
export function resolvePaymentSessionIdFromCallback(
  searchParams: URLSearchParams,
): string {
  const fromSession = searchParams.get('session')?.trim()
  if (fromSession && isAppPaymentSessionId(fromSession)) return fromSession

  const fromPaymob = searchParams.get('paymentSessionId')?.trim()
  if (fromPaymob && isAppPaymentSessionId(fromPaymob)) return fromPaymob

  const stored = readStoredPaymentSessionId()
  if (stored) return stored

  return ''
}

export function isPaymobPaymentFailed(searchParams: URLSearchParams): boolean {
  return searchParams.get('payment')?.trim() === 'failed'
}
