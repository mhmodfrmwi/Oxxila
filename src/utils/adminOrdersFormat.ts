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
  formatDashboardNumber,
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
  if (order.customerName?.trim()) return order.customerName.trim()
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

/** Admin cancel is blocked for delivered/cancelled (matches backend). */
export function canAdminCancelOrder(status: AdminOrderStatus): boolean {
  return status !== 'delivered' && status !== 'cancelled'
}

/**
 * Admin order refund eligibility — mirrors backend `processCardOrderRefund`:
 * paid card orders with Stripe or Paymob only.
 */
export function canAdminRefundOrder(order: {
  paymentMethod: 'cod' | 'card' | null
  paymentProvider: 'stripe' | 'paymob' | null
  paymentStatus: AdminPaymentStatus
}): boolean {
  if (order.paymentStatus !== 'paid') return false
  if (order.paymentMethod !== 'card') return false
  return order.paymentProvider === 'stripe' || order.paymentProvider === 'paymob'
}

/** Committed carrier means a real assignment exists, not just a draft shipment doc. */
export function hasCommittedCarrier(order: ApiAdminOrder): boolean {
  const shipment = order.shipment
  if (!shipment?.carrier && !shipment?.carrierName) return false
  if (shipment.carrierType === 'api') return Boolean(shipment.externalDeliveryId)
  return Boolean(shipment.trackingNumber)
}

function resolveTrackingLabel(order: ApiAdminOrder): string | null {
  return (
    order.shipment?.trackingNumber?.trim() ||
    order.shipment?.providerStateLabel?.trim() ||
    order.shipment?.carrierStatusLabel?.trim() ||
    order.tracking?.trackingNumber?.trim() ||
    null
  )
}

export function mapApiOrderToAdminRow(order: ApiAdminOrder): AdminOrderRow {
  const id = String(order._id)
  const customerName = resolveCustomerName(order)
  const user = order.user && typeof order.user === 'object' ? order.user : null
  return {
    id,
    orderNumber: formatAdminOrderNumber(id),
    createdAt: order.createdAt,
    customerName,
    customerEmail: user?.email?.trim() || null,
    customerInitials: customerInitials(customerName === '—' ? '' : customerName),
    totalPrice: order.totalPrice,
    orderStatus: order.orderStatus,
    orderStatusLabel: order.orderStatusLabel ?? order.orderStatus,
    carrierName: order.shipment?.carrierName?.trim() || null,
    hasCommittedCarrier: hasCommittedCarrier(order),
    trackingLabel: resolveTrackingLabel(order),
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
  return formatDashboardNumber(value, locale)
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

  const address = order.shippingAddress
  const zoneParts = [
    address?.governorateName?.trim(),
    address?.districtName?.trim(),
  ].filter(Boolean)
  const zoneLabel = zoneParts.length > 0 ? zoneParts.join(' / ') : null

  return {
    id,
    orderNumber: formatAdminOrderNumber(id),
    createdAt: order.createdAt,
    customerId: user?._id ?? user?.id ?? null,
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
    carrierName: order.shipment?.carrierName?.trim() || null,
    carrierType: order.shipment?.carrierType ?? null,
    hasAssignedCarrier: hasCommittedCarrier(order),
    zoneLabel,
  }
}

/** Figma Order Details drawer phases — derived from shipment assignment only. */
export type OrderDetailsPhase = 'assign' | 'tracking' | 'apiAssigned'

export function resolveOrderDetailsPhase(
  order: Pick<AdminOrderDetail, 'hasAssignedCarrier' | 'carrierType'>,
): OrderDetailsPhase {
  if (!order.hasAssignedCarrier) return 'assign'
  if (order.carrierType === 'api') return 'apiAssigned'
  return 'tracking'
}

/** Customer card subtitle from real fields only (no invented membership/order counts). */
export function formatOrderCustomerSubtitle(order: AdminOrderDetail): string {
  if (order.customerPhone) return order.customerPhone
  return `${order.paymentStatusLabel} • ${order.orderStatusLabel}`
}
