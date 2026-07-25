// src/utils/adminCustomersFormat.ts
import type {
  AdminCustomerAddress,
  AdminCustomerCreateFields,
  AdminCustomerDetail,
  AdminCustomerFormErrors,
  AdminCustomerFormValues,
  AdminCustomerRow,
  AdminCustomerStats,
  AdminCustomersListParams,
  AdminCustomersSegmentTab,
  AdminCustomerUpdateFields,
  ApiAdminCustomer,
  ApiAdminCustomerAddress,
  ApiAdminCustomerStats,
} from '../types/adminCustomers'
import {
  formatDashboardDate,
  formatDashboardMoney,
  formatDashboardNumber,
} from './adminDashboardFormat'
import { customerInitials } from './adminOrdersFormat'

export const ADMIN_CUSTOMER_NAME_MIN = 2
export const ADMIN_CUSTOMER_NAME_MAX = 60
export const ADMIN_CUSTOMER_PASSWORD_MIN = 8
export const ADMIN_CUSTOMER_PASSWORD_MAX = 128
export const ADMIN_CUSTOMER_PHONE_MAX = 30

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

function resolveSpend(user: ApiAdminCustomer): number | null {
  const spend = user.totalSpend ?? user.totalPaid
  if (spend == null || !Number.isFinite(Number(spend))) return null
  return Number(spend)
}

export function mapApiCustomerStats(
  raw: ApiAdminCustomerStats | null | undefined,
): AdminCustomerStats | null {
  if (!raw) return null
  const total = raw.totalCustomers
  const ltv = raw.averageLtv
  return {
    totalCustomers: {
      value: Number(total?.value ?? 0),
      trend:
        total?.trend == null || !Number.isFinite(Number(total.trend))
          ? null
          : Number(total.trend),
      trendLabel: total?.trendLabel?.trim() || null,
      newThisMonth:
        total?.newThisMonth == null ||
        !Number.isFinite(Number(total.newThisMonth))
          ? null
          : Number(total.newThisMonth),
    },
    averageLtv: {
      value: Number(ltv?.value ?? 0),
      trend:
        ltv?.trend == null || !Number.isFinite(Number(ltv.trend))
          ? null
          : Number(ltv.trend),
      trendLabel: ltv?.trendLabel?.trim() || null,
    },
  }
}

export function mapApiCustomerToAdminRow(user: ApiAdminCustomer): AdminCustomerRow {
  const id = String(user._id)
  const name = user.name?.trim() || '—'
  const email = user.email?.trim() || '—'
  const phone = user.phone?.trim() || null
  const avatar = user.avatar?.trim() || null
  const orders =
    user.orders == null || !Number.isFinite(Number(user.orders))
      ? null
      : Number(user.orders)
  const lastOrder = user.lastOrder?.trim() || null

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
    ordersCount: orders,
    totalSpend: resolveSpend(user),
    lastOrderAt: lastOrder,
  }
}

function formatAddressLine(address: ApiAdminCustomerAddress): string {
  const parts = [
    address.addressLine?.trim(),
    address.district?.name?.trim(),
    address.governorate?.name?.trim(),
  ].filter(Boolean)
  return parts.join(', ') || '—'
}

function mapAddress(
  address: ApiAdminCustomerAddress,
  index: number,
): AdminCustomerAddress {
  return {
    id: address._id ? String(address._id) : `address-${index}`,
    label: address.label?.trim() || null,
    line: formatAddressLine(address),
    isDefault: Boolean(address.isDefault),
  }
}

export function mapApiCustomerToAdminDetail(
  user: ApiAdminCustomer,
): AdminCustomerDetail {
  const id = String(user._id)
  const name = user.name?.trim() || '—'
  const email = user.email?.trim() || null
  const phone = user.phone?.trim() || null
  const avatar = user.avatar?.trim() || null
  const orders =
    user.orders == null || !Number.isFinite(Number(user.orders))
      ? null
      : Number(user.orders)

  return {
    id,
    name,
    email,
    phone,
    avatar,
    initials: customerInitials(name === '—' ? '' : name),
    active: user.active !== false,
    role: user.role ?? 'user',
    storeCreditBalance: Number(user.storeCreditBalance ?? 0),
    createdAt: user.createdAt ?? null,
    addresses: (user.addresses ?? []).map(mapAddress),
    ordersCount: orders,
    totalSpend: resolveSpend(user),
    lastOrderAt: user.lastOrder?.trim() || null,
  }
}

export function emptyCustomerFormValues(): AdminCustomerFormValues {
  return {
    name: '',
    email: '',
    phone: '',
    password: '',
    active: true,
  }
}

export function customerToFormValues(
  customer: AdminCustomerRow | AdminCustomerDetail,
): AdminCustomerFormValues {
  return {
    name: customer.name === '—' ? '' : customer.name,
    email: !customer.email || customer.email === '—' ? '' : customer.email,
    phone: customer.phone ?? '',
    password: '',
    active: customer.active,
  }
}

export function formValuesToCreateFields(
  values: AdminCustomerFormValues,
): AdminCustomerCreateFields {
  const phone = values.phone.trim()
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    password: values.password,
    role: 'user',
    active: values.active,
    ...(phone ? { phone } : {}),
  }
}

export function formValuesToUpdateFields(
  values: AdminCustomerFormValues,
): AdminCustomerUpdateFields {
  const phone = values.phone.trim()
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    active: values.active,
    phone: phone || '',
  }
}

type TranslateFn = (key: string, options?: Record<string, unknown>) => string

/** Client validation aligned with user.validator.js. */
export function validateCustomerForm(
  values: AdminCustomerFormValues,
  mode: 'create' | 'edit',
  t: TranslateFn,
): AdminCustomerFormErrors {
  const errors: AdminCustomerFormErrors = {}
  const name = values.name.trim()
  const email = values.email.trim()
  const phone = values.phone.trim()

  if (!name) {
    errors.name = t('admin.customers.drawer.validation.nameRequired')
  } else if (
    name.length < ADMIN_CUSTOMER_NAME_MIN ||
    name.length > ADMIN_CUSTOMER_NAME_MAX
  ) {
    errors.name = t('admin.customers.drawer.validation.nameLength', {
      min: ADMIN_CUSTOMER_NAME_MIN,
      max: ADMIN_CUSTOMER_NAME_MAX,
    })
  }

  if (!email) {
    errors.email = t('admin.customers.drawer.validation.emailRequired')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = t('admin.customers.drawer.validation.emailInvalid')
  }

  if (phone && phone.length > ADMIN_CUSTOMER_PHONE_MAX) {
    errors.phone = t('admin.customers.drawer.validation.phoneMax', {
      max: ADMIN_CUSTOMER_PHONE_MAX,
    })
  }

  if (mode === 'create') {
    const passwordError = validateCustomerPassword(values.password, t)
    if (passwordError) errors.password = passwordError
  }

  return errors
}

export function validateCustomerPassword(
  password: string,
  t: TranslateFn,
): string | null {
  if (!password) return t('admin.customers.password.validation.required')
  if (
    password.length < ADMIN_CUSTOMER_PASSWORD_MIN ||
    password.length > ADMIN_CUSTOMER_PASSWORD_MAX
  ) {
    return t('admin.customers.password.validation.length', {
      min: ADMIN_CUSTOMER_PASSWORD_MIN,
      max: ADMIN_CUSTOMER_PASSWORD_MAX,
    })
  }
  return null
}

export { formatCount } from './adminOrdersFormat'
