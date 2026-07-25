// src/components/admin/config/adminNav.ts
import {
  ADMIN_BRANDS_PATH,
  ADMIN_CATEGORIES_PATH,
  ADMIN_CUSTOMERS_PATH,
  ADMIN_DASHBOARD_PATH,
  ADMIN_FAQS_PATH,
  ADMIN_ORDERS_PATH,
  ADMIN_PRODUCTS_PATH,
  ADMIN_RETURNS_PATH,
  ADMIN_REVIEWS_PATH,
  ADMIN_SETTINGS_PATH,
  ADMIN_SHIPPING_PATH,
  ADMIN_SUBCATEGORIES_PATH,
} from '../../../config/routes'
import iconBrands from '../../../assets/admin/icon-brands.svg'
import iconCategories from '../../../assets/admin/icon-categories.svg'
import iconCustomers from '../../../assets/admin/icon-customers.svg'
import iconDashboard from '../../../assets/admin/icon-dashboard.svg'
import iconFaqs from '../../../assets/admin/icon-faqs.svg'
import iconOrders from '../../../assets/admin/icon-orders.svg'
import iconProducts from '../../../assets/admin/icon-products.svg'
import iconReturns from '../../../assets/admin/icon-returns.svg'
import iconReviews from '../../../assets/admin/icon-reviews.svg'
import iconShipping from '../../../assets/admin/icon-shipping.svg'
import iconSubcategories from '../../../assets/admin/icon-subcategories.svg'

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

/**
 * Catalog modules kept in-repo and still routed, but omitted from the
 * sidebar so the nav matches the approved Figma. Re-add to ADMIN_NAV_ITEMS
 * to show them again.
 */
export const ADMIN_NAV_ITEMS_HIDDEN_FROM_SIDEBAR: readonly AdminNavItem[] = [
  {
    id: 'categories',
    labelKey: 'admin.nav.categories',
    to: ADMIN_CATEGORIES_PATH,
    iconSrc: iconCategories,
    iconSize: 24,
  },
  {
    id: 'brands',
    labelKey: 'admin.nav.brands',
    to: ADMIN_BRANDS_PATH,
    iconSrc: iconBrands,
    iconSize: 24,
  },
  {
    id: 'subcategories',
    labelKey: 'admin.nav.subcategories',
    to: ADMIN_SUBCATEGORIES_PATH,
    iconSrc: iconSubcategories,
    iconSize: 24,
  },
  {
    id: 'faqs',
    labelKey: 'admin.nav.faqs',
    to: ADMIN_FAQS_PATH,
    iconSrc: iconFaqs,
    iconSize: 24,
  },
]

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
  {
    id: 'returns',
    labelKey: 'admin.nav.returns',
    to: ADMIN_RETURNS_PATH,
    iconSrc: iconReturns,
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
