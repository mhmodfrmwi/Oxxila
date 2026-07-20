// src/components/admin/config/adminNav.ts
import {
  ADMIN_CUSTOMERS_PATH,
  ADMIN_DASHBOARD_PATH,
  ADMIN_ORDERS_PATH,
  ADMIN_PRODUCTS_PATH,
  ADMIN_REVIEWS_PATH,
  ADMIN_SETTINGS_PATH,
  ADMIN_SHIPPING_PATH,
} from '../../../config/routes'
import iconCustomers from '../../../assets/admin/icon-customers.svg'
import iconDashboard from '../../../assets/admin/icon-dashboard.svg'
import iconOrders from '../../../assets/admin/icon-orders.svg'
import iconProducts from '../../../assets/admin/icon-products.svg'
import iconReviews from '../../../assets/admin/icon-reviews.svg'
import iconShipping from '../../../assets/admin/icon-shipping.svg'

export interface AdminNavItem {
  id: string
  labelKey: string
  to: string
  /** Exact SVG extracted from Figma Admin Sidebar (Component 50). */
  iconSrc: string
  /** Native icon frame size from Figma (px). */
  iconSize: 20 | 24
  /** Exact match for dashboard root; prefix match for nested routes. */
  end?: boolean
}

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  {
    id: 'dashboard',
    labelKey: 'admin.nav.dashboard',
    to: ADMIN_DASHBOARD_PATH,
    iconSrc: iconDashboard,
    iconSize: 24,
    end: true,
  },
  {
    id: 'products',
    labelKey: 'admin.nav.products',
    to: ADMIN_PRODUCTS_PATH,
    iconSrc: iconProducts,
    iconSize: 20,
  },
  {
    id: 'orders',
    labelKey: 'admin.nav.orders',
    to: ADMIN_ORDERS_PATH,
    iconSrc: iconOrders,
    iconSize: 24,
  },
  {
    id: 'customers',
    labelKey: 'admin.nav.customers',
    to: ADMIN_CUSTOMERS_PATH,
    iconSrc: iconCustomers,
    iconSize: 24,
  },
  {
    id: 'reviews',
    labelKey: 'admin.nav.reviews',
    to: ADMIN_REVIEWS_PATH,
    iconSrc: iconReviews,
    iconSize: 24,
  },
  {
    id: 'shipping',
    labelKey: 'admin.nav.shipping',
    to: ADMIN_SHIPPING_PATH,
    iconSrc: iconShipping,
    iconSize: 24,
  },
]

export const ADMIN_SETTINGS_NAV: Omit<AdminNavItem, 'iconSrc' | 'iconSize'> & {
  to: string
  labelKey: string
} = {
  id: 'settings',
  labelKey: 'admin.nav.settings',
  to: ADMIN_SETTINGS_PATH,
}
