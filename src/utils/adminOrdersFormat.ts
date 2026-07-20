// src/utils/adminOrdersFormat.ts
import type { StatusBadgeTone } from '../components/admin/ui/StatusBadge'
import type {
  AdminOrderDetail,
  AdminOrderRow,
  AdminOrderStatus,
  AdminOrdersStatusTab,
  AdminPaymentStatus,
  ApiAdminOrder,
} from '../types/adminOrders'
import {
  formatDashboardDate,
  formatDashboardMoney,
  formatOrderId,
  resolveDashboardLocale,
} from './adminDashboardFormat'

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/

export function isMongoObjectId(value: string): boolean {
  return OBJECT_ID_RE.test(value.trim())
}

export function formatAdminOrderMoney(value: number, locale = 'en'): string {
  return formatDashboardMoney(value, locale)
}

export function formatAdminOrderDate(value: string, locale = 'en'): string {
  return formatDashboardDate(value, locale)
}

/** Date + time for timeline steps when a real timestamp exists. */
export function formatAdminOrderDateTime(value: string, locale = 'en'): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const day = formatDashboardDate(value, locale)
  const time = new Intl.DateTimeFormat(resolveDashboardLocale(locale), {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
  return `${day} • ${time}`
}

export function formatAdminOrderNumber(id: string): string {
  return formatOrderId(id)
}

export function customerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
}

function resolveCustomerName(order: ApiAdminOrder): string {
  const user = order.user
  if (user && typeof user === 'object' && user.name?.trim()) return user.name.trim()
  return '—'
}

export function orderStatusBadgeTone(status: AdminOrderStatus): StatusBadgeTone {
  switch (status) {
    case 'delivered':
    case 'confirmed':
      return 'success'
    case 'shipped':
    case 'out_for_delivery':
      return 'info'
    case 'pending':
    case 'processing':
    case 'failed_attempt':
      return 'warning'
    case 'returned':
    case 'partially_returned':
    case 'cancelled':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function paymentStatusBadgeTone(status: AdminPaymentStatus): StatusBadgeTone {
  switch (status) {
    case 'paid':
      return 'success'
    case 'pending':
      return 'warning'
    case 'refunded':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function statusTabToOrderStatus(
  tab: AdminOrdersStatusTab,
): AdminOrderStatus | undefined {
  if (tab === 'all') return undefined
  return tab
}

export function mapApiOrderToAdminRow(order: ApiAdminOrder): AdminOrderRow {
  const id = String(order._id)
  const customerName = resolveCustomerName(order)
  return {
    id,
    orderNumber: formatAdminOrderNumber(id),
    createdAt: order.createdAt,
    customerName,
    customerInitials: customerInitials(customerName === '—' ? '' : customerName),
    totalPrice: order.totalPrice,
    paymentStatus: order.paymentStatus,
    paymentStatusLabel: order.paymentStatusLabel ?? order.paymentStatus,
    orderStatus: order.orderStatus,
    orderStatusLabel: order.orderStatusLabel ?? order.orderStatus,
  }
}

/** End of local calendar day as ISO for `createdAt[lte]`. */
export function endOfDayIso(dateInput: string): string | undefined {
  if (!dateInput) return undefined
  const date = new Date(`${dateInput}T23:59:59.999`)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
}

/** Start of local calendar day as ISO for `createdAt[gte]`. */
export function startOfDayIso(dateInput: string): string | undefined {
  if (!dateInput) return undefined
  const date = new Date(`${dateInput}T00:00:00.000`)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
}

export function formatCount(value: number, locale = 'en'): string {
  return new Intl.NumberFormat(resolveDashboardLocale(locale)).format(value)
}

function formatPaymentSummary(order: ApiAdminOrder): string {
  const method = order.paymentMethod
  if (method === 'cod') return 'COD'
  if (method === 'card') {
    const provider = order.paymentProvider
      ? order.paymentProvider.charAt(0).toUpperCase() + order.paymentProvider.slice(1)
      : 'Card'
    return provider
  }
  return order.paymentStatusLabel ?? order.paymentStatus
}

export function mapApiOrderToAdminDetail(order: ApiAdminOrder): AdminOrderDetail {
  const id = String(order._id)
  const user = order.user && typeof order.user === 'object' ? order.user : null
  const customerName = resolveCustomerName(order)
  const paymentStatusLabel = order.paymentStatusLabel ?? order.paymentStatus
  const orderStatusLabel = order.orderStatusLabel ?? order.orderStatus
  const shippingMethodName =
    order.shipment?.carrierName?.trim() ||
    order.shipping?.methodName?.trim() ||
    order.tracking?.carrierName?.trim() ||
    '—'

  return {
    id,
    orderNumber: formatAdminOrderNumber(id),
    createdAt: order.createdAt,
    customerName,
    customerEmail: user?.email?.trim() || null,
    customerPhone: user?.phone?.trim() || null,
    customerInitials: customerInitials(customerName === '—' ? '' : customerName),
    paymentMethod: order.paymentMethod ?? null,
    paymentProvider: order.paymentProvider ?? null,
    paymentStatus: order.paymentStatus,
    paymentStatusLabel,
    paymentSummary: formatPaymentSummary(order),
    orderStatus: order.orderStatus,
    orderStatusLabel,
    shippingMethodName,
    items: order.items ?? [],
    trackingSteps: order.tracking?.steps ?? [],
    trackingNumber:
      order.tracking?.trackingNumber ?? order.shipment?.trackingNumber ?? null,
    totalPrice: order.totalPrice,
  }
}

/** Customer card subtitle from real fields only (no invented membership/order counts). */
export function formatOrderCustomerSubtitle(order: AdminOrderDetail): string {
  if (order.customerPhone) return order.customerPhone
  return `${order.paymentStatusLabel} • ${order.orderStatusLabel}`
}
