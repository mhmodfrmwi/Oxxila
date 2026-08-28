// src/utils/adminActivityNavigation.ts
import {
  ADMIN_BRANDS_PATH,
  ADMIN_CATEGORIES_PATH,
  ADMIN_CUSTOMERS_PATH,
  ADMIN_ORDERS_PATH,
  ADMIN_PRODUCTS_PATH,
  ADMIN_RETURNS_PATH,
  ADMIN_REVIEWS_PATH,
  ADMIN_SETTINGS_PATH,
  ADMIN_SHIPPING_PATH,
  ADMIN_WEBSITE_CONTENT_PATH,
} from '../config/routes'
import { formatAdminOrderNumber } from './adminOrdersFormat'

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i

/** Tabs shown as Settings in the activity log module column. */
export const SETTINGS_ACTIVITY_TABS = new Set([
  'settings',
  'websiteContent',
  'roles',
  'dashboard',
])

/** Tabs hidden from the activity log module filter (grouped elsewhere). */
export const HIDDEN_ACTIVITY_TAB_FILTERS = new Set([
  'faqs',
  'subcategories',
  'dashboard',
  'websiteContent',
  'roles',
])

export function isMongoObjectId(value: string): boolean {
  return OBJECT_ID_RE.test(value.trim())
}

export function resolveActivityLogDisplayTab(tab: string): string {
  return SETTINGS_ACTIVITY_TABS.has(tab) ? 'settings' : tab
}

/** Admin list page + `?open=` deep-link for drawer/detail panels. */
export function resolveAdminActivityHref(
  resourceType: string,
  resourceId: string,
  options?: { productId?: string | null },
): string | null {
  const id = resourceId?.trim()
  if (!id || !isMongoObjectId(id)) return null

  switch (resourceType) {
    case 'order':
      return `${ADMIN_ORDERS_PATH}?open=${encodeURIComponent(id)}`
    case 'product':
      return `${ADMIN_PRODUCTS_PATH}?open=${encodeURIComponent(id)}`
    case 'category':
      return `${ADMIN_CATEGORIES_PATH}?open=${encodeURIComponent(id)}`
    case 'subCategory':
    case 'subcategory':
      return `${ADMIN_CATEGORIES_PATH}?open=${encodeURIComponent(id)}`
    case 'brand':
      return `${ADMIN_BRANDS_PATH}?open=${encodeURIComponent(id)}`
    case 'carrier':
      return `${ADMIN_SHIPPING_PATH}?open=${encodeURIComponent(id)}`
    case 'user':
    case 'customer':
      return `${ADMIN_CUSTOMERS_PATH}?open=${encodeURIComponent(id)}`
    case 'returnRequest':
    case 'return':
      return `${ADMIN_RETURNS_PATH}?open=${encodeURIComponent(id)}`
    case 'review':
      return `${ADMIN_REVIEWS_PATH}?open=${encodeURIComponent(id)}`
    case 'banner':
      return `${ADMIN_SETTINGS_PATH}?open=${encodeURIComponent(id)}`
    case 'faq': {
      const productId = options?.productId?.trim()
      if (productId && isMongoObjectId(productId)) {
        return `${ADMIN_PRODUCTS_PATH}?open=${encodeURIComponent(productId)}`
      }
      return null
    }
    case 'contentPage':
      return ADMIN_WEBSITE_CONTENT_PATH
    default:
      return null
  }
}

/** Fallback label when API still returns a raw ObjectId. */
export function formatActivityResourceLabelFallback(
  resourceType: string,
  resourceId: string,
  resourceLabel: string,
): string {
  const label = resourceLabel?.trim()
  if (label && label !== '—' && !isMongoObjectId(label) && label !== resourceId) {
    return label
  }

  if (resourceType === 'order' && isMongoObjectId(resourceId)) {
    return `Order ${formatAdminOrderNumber(resourceId)}`
  }

  return label || '—'
}
