// src/utils/adminPermissions.ts
import type { AuthUser } from '../api/auth'
import type { AdminNavItem } from '../components/admin/config/adminNav'
import {
  ADMIN_TAB_KEYS,
  type AdminCrudAction,
  type AdminPermissionsMap,
  type AdminTabKey,
  type AdminTabPermissions,
  type ApiAdminRole,
} from '../types/adminPermissions'

export const SUPER_ADMIN_SLUG = 'super-admin'

export const emptyCrud = (): AdminTabPermissions => ({
  create: false,
  read: false,
  update: false,
  delete: false,
})

const fullCrud = (): AdminTabPermissions => ({
  create: true,
  read: true,
  update: true,
  delete: true,
})

export function buildFullPermissions(): AdminPermissionsMap {
  return Object.fromEntries(
    ADMIN_TAB_KEYS.map((key) => [key, fullCrud()]),
  ) as AdminPermissionsMap
}

export function normalizePermissions(input?: Partial<AdminPermissionsMap>): AdminPermissionsMap {
  const src = input ?? {}
  const out = {} as AdminPermissionsMap

  for (const key of ADMIN_TAB_KEYS) {
    const row = src[key]
    out[key] = {
      create: Boolean(row?.create),
      read: Boolean(row?.read),
      update: Boolean(row?.update),
      delete: Boolean(row?.delete),
    }
  }

  return out
}

export function isSuperAdminRole(role: ApiAdminRole | null | undefined): boolean {
  if (!role) return false
  return Boolean(role.isSystem) || role.slug === SUPER_ADMIN_SLUG
}

export function resolveAdminPermissions(user: AuthUser | null): AdminPermissionsMap | null {
  if (!user || user.role?.toLowerCase() !== 'admin') return null
  if (!user.adminRole) return buildFullPermissions()
  if (isSuperAdminRole(user.adminRole)) return buildFullPermissions()
  return normalizePermissions(user.adminRole.permissions)
}

export function can(
  permissions: AdminPermissionsMap | null,
  tab: AdminTabKey,
  action: AdminCrudAction,
): boolean {
  if (!permissions) return false
  return Boolean(permissions[tab]?.[action])
}

export function canReadTab(
  permissions: AdminPermissionsMap | null,
  tab: AdminTabKey,
): boolean {
  return can(permissions, tab, 'read')
}

export function filterAdminNavItems(
  items: readonly AdminNavItem[],
  permissions: AdminPermissionsMap | null,
): AdminNavItem[] {
  if (!permissions) return []
  return items.filter((item) => canReadTab(permissions, item.id as AdminTabKey))
}

const PATH_TAB_RULES: Array<{ prefix: string; tab: AdminTabKey; exact?: boolean }> = [
  { prefix: '/admin/reports', tab: 'reports' },
  { prefix: '/admin/website-content', tab: 'websiteContent' },
  { prefix: '/admin/settings', tab: 'settings' },
  { prefix: '/admin/products', tab: 'products' },
  { prefix: '/admin/categories', tab: 'categories' },
  { prefix: '/admin/brands', tab: 'brands' },
  { prefix: '/admin/subcategories', tab: 'subcategories' },
  { prefix: '/admin/orders', tab: 'orders' },
  { prefix: '/admin/customers', tab: 'customers' },
  { prefix: '/admin/reviews', tab: 'reviews' },
  { prefix: '/admin/shipping', tab: 'shipping' },
  { prefix: '/admin/returns', tab: 'returns' },
  { prefix: '/admin/faqs', tab: 'faqs' },
  { prefix: '/admin', tab: 'dashboard', exact: true },
]

export function resolveAdminTabFromPath(pathname: string): AdminTabKey | null {
  for (const rule of PATH_TAB_RULES) {
    if (rule.exact) {
      if (pathname === rule.prefix || pathname === `${rule.prefix}/`) return rule.tab
      continue
    }
    if (pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)) {
      return rule.tab
    }
  }
  return null
}

export function firstAllowedAdminPath(permissions: AdminPermissionsMap | null): string | null {
  if (!permissions) return null

  const ordered: Array<{ tab: AdminTabKey; path: string }> = [
    { tab: 'dashboard', path: '/admin' },
    { tab: 'reports', path: '/admin/reports' },
    { tab: 'products', path: '/admin/products' },
    { tab: 'categories', path: '/admin/categories' },
    { tab: 'websiteContent', path: '/admin/website-content' },
    { tab: 'orders', path: '/admin/orders' },
    { tab: 'customers', path: '/admin/customers' },
    { tab: 'reviews', path: '/admin/reviews' },
    { tab: 'shipping', path: '/admin/shipping' },
    { tab: 'returns', path: '/admin/returns' },
    { tab: 'brands', path: '/admin/brands' },
    { tab: 'subcategories', path: '/admin/subcategories' },
    { tab: 'faqs', path: '/admin/faqs' },
    { tab: 'settings', path: '/admin/settings' },
  ]

  for (const entry of ordered) {
    if (canReadTab(permissions, entry.tab)) return entry.path
  }

  return null
}
