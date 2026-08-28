// src/types/adminAudit.ts

export interface AdminAuditActor {
  id: string
  name: string
  email: string
}

export interface AdminAuditBlock {
  createdBy: AdminAuditActor | null
  updatedBy: AdminAuditActor | null
  statusUpdatedBy?: AdminAuditActor | null
  createdAt: string | null
  updatedAt: string | null
}

export interface ApiAdminAuditBlock {
  createdBy?: { _id?: string; id?: string; name?: string; email?: string } | string | null
  updatedBy?: { _id?: string; id?: string; name?: string; email?: string } | string | null
  statusUpdatedBy?: { _id?: string; id?: string; name?: string; email?: string } | string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface ApiAdminActivityLog {
  _id: string
  actor: string
  actorName: string
  actorEmail: string
  tab: string
  action: string
  resourceType: string
  resourceId: string
  resourceLabel: string
  summary: string
  changes?: Record<string, { from?: unknown; to?: unknown }> | null
  createdAt: string
  productId?: string
}

export const ADMIN_ACTIVITY_ACTIONS = [
  'create',
  'update',
  'delete',
  'hide',
  'show',
  'assign',
  'refund',
  'cancel',
  'sync',
  'activate',
  'deactivate',
  'flag',
  'unflag',
] as const

export type AdminActivityAction = (typeof ADMIN_ACTIVITY_ACTIONS)[number]

export const ADMIN_ACTIVITY_RESOURCE_TYPES = [
  'product',
  'category',
  'subcategory',
  'brand',
  'order',
  'carrier',
  'country',
  'governorate',
  'district',
  'return',
  'review',
  'customer',
  'banner',
  'coupon',
  'offer',
  'faq',
  'settings',
  'contentPage',
  'adminRole',
  'adminUser',
  'shipment',
] as const

export type AdminActivityResourceType = (typeof ADMIN_ACTIVITY_RESOURCE_TYPES)[number]

export interface AdminActivityLogRow {
  id: string
  actorName: string
  actorEmail: string
  actorInitials: string
  tab: string
  action: string
  resourceType: string
  resourceId: string
  resourceLabel: string
  summary: string
  createdAt: string
  href: string | null
}
