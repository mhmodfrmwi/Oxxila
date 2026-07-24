// src/components/admin/config/adminPageShell.ts
import {
  ADMIN_CUSTOMERS_PATH,
  ADMIN_DASHBOARD_PATH,
  ADMIN_ORDERS_PATH,
  ADMIN_PATH,
  ADMIN_PRODUCTS_PATH,
  ADMIN_REVIEWS_PATH,
  ADMIN_SETTINGS_PATH,
  ADMIN_SHIPPING_PATH,
} from '../../../config/routes'

/**
 * Canonical Admin shell — Settings Figma `937:21865`, scaled ×0.8 so 100%
 * browser zoom matches the previous 80% zoom appearance.
 *
 * Component 50 sidebar ≈ 211.43px. Main.x / content start = 204.8.
 */
export type AdminScreenId =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'customers'
  | 'reviews'
  | 'shipping'
  | 'settings'
  | 'default'

export interface AdminPageShell {
  id: AdminScreenId
  /** Background pl / Main.x — content start, not sidebar width */
  mainOffsetPx: number
  contentPaddingPx: number
  /** Vertical gap: Header → body */
  contentGapPx: number
  titleSizePx: number
  titleLineHeightPx: number
  subtitleSizePx: number
  subtitleLineHeightPx: number
  titleSubtitleGapPx: number
}

/** Figma → app scale (100% zoom ≈ former 80% zoom) */
export const ADMIN_UI_SCALE = 0.8

/** Figma Component 50 width × scale */
export const ADMIN_SIDEBAR_WIDTH_PX = 264.2857 * ADMIN_UI_SCALE

/** Settings frame outer shell × scale — applied to all Admin pages */
export const ADMIN_SHELL: Omit<AdminPageShell, 'id'> = {
  mainOffsetPx: 256 * ADMIN_UI_SCALE,
  contentPaddingPx: 32 * ADMIN_UI_SCALE,
  contentGapPx: 32 * ADMIN_UI_SCALE,
  titleSizePx: 30 * ADMIN_UI_SCALE,
  titleLineHeightPx: 36 * ADMIN_UI_SCALE,
  subtitleSizePx: 16 * ADMIN_UI_SCALE,
  subtitleLineHeightPx: 24 * ADMIN_UI_SCALE,
  titleSubtitleGapPx: 4 * ADMIN_UI_SCALE,
}

function withId(id: AdminScreenId): AdminPageShell {
  return { ...ADMIN_SHELL, id }
}

export function resolveAdminPageShell(pathname: string): AdminPageShell {
  const path = pathname.replace(/\/$/, '') || '/'

  if (path === ADMIN_PATH || path === ADMIN_DASHBOARD_PATH) return withId('dashboard')
  if (path.startsWith(ADMIN_PRODUCTS_PATH)) return withId('products')
  if (path.startsWith(ADMIN_ORDERS_PATH)) return withId('orders')
  if (path.startsWith(ADMIN_CUSTOMERS_PATH)) return withId('customers')
  if (path.startsWith(ADMIN_REVIEWS_PATH)) return withId('reviews')
  if (path.startsWith(ADMIN_SHIPPING_PATH)) return withId('shipping')
  if (path.startsWith(ADMIN_SETTINGS_PATH)) return withId('settings')
  return withId('default')
}

export function adminPageShellStyle(
  shell: AdminPageShell,
): Record<string, string> {
  return {
    '--admin-sidebar-width': `${ADMIN_SIDEBAR_WIDTH_PX}px`,
    '--admin-main-offset': `${shell.mainOffsetPx}px`,
    '--admin-content-padding': `${shell.contentPaddingPx}px`,
    '--admin-content-gap': `${shell.contentGapPx}px`,
    '--admin-page-title-size': `${shell.titleSizePx}px`,
    '--admin-page-title-leading': `${shell.titleLineHeightPx}px`,
    '--admin-page-subtitle-size': `${shell.subtitleSizePx}px`,
    '--admin-page-subtitle-leading': `${shell.subtitleLineHeightPx}px`,
    '--admin-title-subtitle-gap': `${shell.titleSubtitleGapPx}px`,
  }
}
