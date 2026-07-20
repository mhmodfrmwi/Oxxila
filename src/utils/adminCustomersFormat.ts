// src/utils/adminCustomersFormat.ts
import type {
  AdminCustomerRow,
  AdminCustomersListParams,
  AdminCustomersSegmentTab,
  ApiAdminCustomer,
} from '../types/adminCustomers'
import {
  formatDashboardDate,
  formatDashboardMoney,
  formatDashboardNumber,
  resolveDashboardLocale,
} from './adminDashboardFormat'
import { customerInitials } from './adminOrdersFormat'

export function formatCustomerCount(value: number, locale = 'en'): string {
  return formatDashboardNumber(value, locale)
}

export function formatCustomerMoney(value: number, locale = 'en'): string {
  return formatDashboardMoney(value, locale)
}

export function formatCustomerDate(value: string, locale = 'en'): string {
  return formatDashboardDate(value, locale)
}

export function formatUnavailableMetric(): string {
  return '—'
}

/** Tabs without a matching list filter on GET /users. */
export function isUnsupportedCustomerSegment(
  tab: AdminCustomersSegmentTab,
): boolean {
  return tab === 'vip' || tab === 'frequent'
}

export function segmentTabToListParams(
  tab: AdminCustomersSegmentTab,
): Pick<AdminCustomersListParams, 'role' | 'active'> {
  const base: Pick<AdminCustomersListParams, 'role' | 'active'> = {
    role: 'user',
  }
  if (tab === 'inactive') {
    return { ...base, active: false }
  }
  return base
}

export function mapApiCustomerToAdminRow(user: ApiAdminCustomer): AdminCustomerRow {
  const id = String(user._id)
  const name = user.name?.trim() || '—'
  const email = user.email?.trim() || '—'
  const phone = user.phone?.trim() || null
  const avatar = user.avatar?.trim() || null

  return {
    id,
    name,
    email,
    phone,
    avatar,
    initials: customerInitials(name === '—' ? '' : name),
    active: user.active !== false,
    role: user.role ?? 'user',
    createdAt: user.createdAt ?? '',
    ordersCount: null,
    ltv: null,
    lastVisitAt: null,
  }
}

export function formatCount(value: number, locale = 'en'): string {
  return new Intl.NumberFormat(resolveDashboardLocale(locale)).format(value)
}
