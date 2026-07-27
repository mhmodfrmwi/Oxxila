/** localStorage / sessionStorage keys — keep in sync with index.html inline scripts. */
export const STORAGE_KEYS = {
  theme: 'oxxila-theme',
  language: 'oxxila-language',
  authToken: 'oxxila_access_token',
  user: 'oxxila_user',
  oauthError: 'oxxila_oauth_error',
  /** Session-only dashboard low-stock threshold preference. */
  dashboardLowStockThreshold: 'oxxila_dashboard_low_stock_threshold',
} as const
