/** localStorage / sessionStorage keys — keep in sync with index.html inline scripts. */
export const STORAGE_KEYS = {
  theme: 'oxxila-theme',
  language: 'oxxila-language',
  authToken: 'oxxila_access_token',
  user: 'oxxila_user',
  oauthError: 'oxxila_oauth_error',
  /** Guest cart lines `{ productId, quantity }[]` until the shopper signs in. */
  guestCart: 'oxxila_guest_cart',
  /** Guest browsing history: product ids, newest first (max 20). */
  guestBrowsingHistory: 'oxxila_guest_browsing_history',
  /** Guest wishlist: product ids, newest first. Merged into the account on login. */
  guestWishlist: 'oxxila_guest_wishlist',
  /** Promo code a guest entered; applied automatically after they sign in. */
  pendingCoupon: 'oxxila_pending_coupon',
  /** Path to return to after login/register/OAuth (e.g. checkout). */
  authReturnTo: 'oxxila_auth_return_to',
  /** Session-only dashboard low-stock threshold preference. */
  dashboardLowStockThreshold: 'oxxila_dashboard_low_stock_threshold',
} as const
