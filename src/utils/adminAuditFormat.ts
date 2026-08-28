// src/utils/adminAuditFormat.ts
import type {
  AdminActivityLogRow,
  AdminAuditActor,
  AdminAuditBlock,
  ApiAdminActivityLog,
  ApiAdminAuditBlock,
} from '../types/adminAudit'
import {
  formatActivityResourceLabelFallback,
  resolveAdminActivityHref,
} from './adminActivityNavigation'
import { getAdminInitials } from './adminUsersFormat'

function mapAuditActor(
  value: ApiAdminAuditBlock['createdBy'],
): AdminAuditActor | null {
  if (!value) return null
  if (typeof value === 'string') {
    return { id: value, name: 'Admin', email: '' }
  }
  const id = value._id ?? value.id
  if (!id) return null
  return {
    id: String(id),
    name: value.name?.trim() || 'Admin',
    email: value.email?.trim() || '',
  }
}

export function mapApiAuditBlock(input?: ApiAdminAuditBlock | null): AdminAuditBlock | null {
  if (!input) return null

  const block: AdminAuditBlock = {
    createdBy: mapAuditActor(input.createdBy),
    updatedBy: mapAuditActor(input.updatedBy),
    statusUpdatedBy: mapAuditActor(input.statusUpdatedBy),
    createdAt: input.createdAt ?? null,
    updatedAt: input.updatedAt ?? null,
  }

  if (
    !block.createdBy &&
    !block.updatedBy &&
    !block.statusUpdatedBy &&
    !block.createdAt &&
    !block.updatedAt
  ) {
    return null
  }

  return block
}

export function mapApiActivityLogToRow(log: ApiAdminActivityLog): AdminActivityLogRow {
  const resourceId = String(log.resourceId ?? '')
  const resourceLabel = formatActivityResourceLabelFallback(
    log.resourceType,
    resourceId,
    log.resourceLabel?.trim() || '—',
  )

  return {
    id: String(log._id),
    actorName: log.actorName?.trim() || 'Admin',
    actorEmail: log.actorEmail?.trim() || '',
    actorInitials: getAdminInitials(log.actorName?.trim() || log.actorEmail || 'Admin'),
    tab: log.tab,
    action: log.action,
    resourceType: log.resourceType,
    resourceId,
    resourceLabel,
    summary: log.summary?.trim() || '—',
    createdAt: log.createdAt,
    href: resolveAdminActivityHref(log.resourceType, resourceId, {
      productId: log.productId,
    }),
  }
}

export function formatAdminAuditDate(value: string | null | undefined, locale: string): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat(locale.startsWith('ar') ? 'ar-EG' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
