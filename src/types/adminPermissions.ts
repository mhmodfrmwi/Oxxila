// src/types/adminPermissions.ts

export const ADMIN_TAB_KEYS = [
  'dashboard',
  'reports',
  'products',
  'categories',
  'brands',
  'subcategories',
  'orders',
  'customers',
  'reviews',
  'shipping',
  'returns',
  'faqs',
  'settings',
  'roles',
  'websiteContent',
] as const

export type AdminTabKey = (typeof ADMIN_TAB_KEYS)[number]

export type AdminCrudAction = 'create' | 'read' | 'update' | 'delete'

export type AdminTabPermissions = Record<AdminCrudAction, boolean>

export type AdminPermissionsMap = Record<AdminTabKey, AdminTabPermissions>

export interface ApiAdminRole {
  _id: string
  name: string
  slug: string
  description?: string
  isSystem?: boolean
  permissions: AdminPermissionsMap
}

export interface ApiAdminRoleTabMeta {
  key: AdminTabKey
  label: string
}
