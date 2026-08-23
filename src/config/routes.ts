/** Landing page — matches backend OAUTH_SUCCESS_REDIRECT (…/home). */
export const HOME_PATH = '/home'

export const DOCS_PATH = '/docs'

/** CMS About page (legacy /docs redirects here). */
export const ABOUT_PATH = '/about'

export const TERMS_PATH = '/terms'

export const PRIVACY_PATH = '/privacy'

export const REFUND_POLICY_PATH = '/refund-policy'

export const SHIPPING_POLICY_PATH = '/shipping-policy'

export const SHOP_PATH = '/shop'

export const CATEGORIES_PATH = '/categories'

export const PRODUCTS_PATH = '/products'

export const LOGIN_PATH = '/login'

export const REGISTER_PATH = '/register'

export const FORGOT_PASSWORD_PATH = '/forgot-password'

export const VERIFY_OTP_PATH = '/forgot-password/verify'

export const RESET_PASSWORD_PATH = '/reset-password'

export const CHANGE_PASSWORD_PATH = '/change-password'

export const SEARCH_PATH = '/search'

export const CART_PATH = '/cart'

export const MY_ACCOUNT_PATH = '/account'

export const ACCOUNT_ORDERS_PATH = '/account/orders'

export const ADDRESSES_PATH = '/account/addresses'

export const ADD_ADDRESS_PATH = '/account/addresses/add'

export const ACCOUNT_CHANGE_PASSWORD_PATH = '/account/change-password'

export const ACCOUNT_GIFT_CARDS_PATH = '/account/gift-cards'

export const CHECKOUT_PATH = '/checkout'

export const PAYMENT_PATH = '/checkout/payment'

export const PAYMENT_CALLBACK_PATH = '/payment-callback'

/** Stripe / Paymob success redirect — backend sets this as the provider success URL. */
export function paymentCallbackPath(sessionId: string) {
  return `${PAYMENT_CALLBACK_PATH}?session=${encodeURIComponent(sessionId)}`
}

export const ORDER_CONFIRMATION_PATH = '/checkout/confirmation'

export function orderConfirmationPath(orderId: string) {
  return `${ORDER_CONFIRMATION_PATH}/${orderId}`
}

export const TRACK_ORDER_PATH = '/track/order'

export function trackOrderPath(orderId: string) {
  return `${TRACK_ORDER_PATH}/${orderId}`
}

export const COLLECTIONS_PATH = '/collections'

export function collectionPath(slug: string) {
  return `${COLLECTIONS_PATH}/${slug}`
}

export const RETURNS_PATH = '/returns'

export const RETURNS_HISTORY_PATH = '/returns/history'

export const WISHLIST_PATH = '/wishlist'

/** Admin dashboard root (role-gated). */
export const ADMIN_PATH = '/admin'

export const ADMIN_DASHBOARD_PATH = ADMIN_PATH
export const ADMIN_PRODUCTS_PATH = `${ADMIN_PATH}/products`
export const ADMIN_CATEGORIES_PATH = `${ADMIN_PATH}/categories`
export const ADMIN_BRANDS_PATH = `${ADMIN_PATH}/brands`
export const ADMIN_SUBCATEGORIES_PATH = `${ADMIN_PATH}/subcategories`
export const ADMIN_FAQS_PATH = `${ADMIN_PATH}/faqs`
export const ADMIN_ORDERS_PATH = `${ADMIN_PATH}/orders`
export const ADMIN_CUSTOMERS_PATH = `${ADMIN_PATH}/customers`
export const ADMIN_REVIEWS_PATH = `${ADMIN_PATH}/reviews`
export const ADMIN_SHIPPING_PATH = `${ADMIN_PATH}/shipping`
export const ADMIN_RETURNS_PATH = `${ADMIN_PATH}/returns`
export const ADMIN_SETTINGS_PATH = `${ADMIN_PATH}/settings`

export const ADMIN_WEBSITE_CONTENT_PATH = `${ADMIN_PATH}/website-content`
