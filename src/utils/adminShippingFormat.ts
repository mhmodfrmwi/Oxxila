// src/utils/adminShippingFormat.ts
import type { StatusBadgeTone } from '../components/admin/ui/StatusBadge'
import type { AdminOrderStatus, ApiAdminOrder } from '../types/adminOrders'
import type {
  AdminCarrierRow,
  AdminCarrierType,
  AdminShipmentDetail,
  AdminShippingMethodKind,
  AdminShippingOrderRow,
  AdminShippingOrdersTab,
  ApiAdminCarrier,
  ApiAdminShipmentDetail,
} from '../types/adminShipping'
import { formatAdminOrderNumber, customerInitials } from './adminOrdersFormat'

export function shippingOrdersTabToOrderStatus(
  tab: AdminShippingOrdersTab,
): AdminOrderStatus | undefined {
  if (tab === 'all') return undefined
  return tab
}

export function carrierStatusBadgeTone(isActive: boolean): StatusBadgeTone {
  return isActive ? 'success' : 'neutral'
}

export function shippingOrderStatusBadgeTone(
  status: AdminOrderStatus,
): StatusBadgeTone {
  switch (status) {
    case 'delivered':
      return 'success'
    case 'shipped':
    case 'out_for_delivery':
      return 'accent'
    case 'pending':
    case 'confirmed':
    case 'processing':
      return 'warning'
    case 'cancelled':
    case 'returned':
    case 'failed_attempt':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function carrierInitials(name: string): string {
  return customerInitials(name)
}

export function mapApiCarrierToAdminRow(carrier: ApiAdminCarrier): AdminCarrierRow {
  const coverage = (carrier.coverage ?? []).filter(Boolean)
  return {
    id: String(carrier._id),
    name: carrier.name?.trim() || '—',
    code: carrier.code?.trim() || '—',
    type: carrier.type ?? 'known',
    logo: carrier.logo?.trim() || null,
    deliveryDays: carrier.deliveryDays?.trim() || null,
    cost: null,
    coverageLabel: coverage.length > 0 ? coverage.join(', ') : '—',
    isActive: carrier.isActive !== false,
  }
}

function resolveCustomerName(order: ApiAdminOrder): string {
  const user = order.user
  if (user && typeof user === 'object' && user.name?.trim()) return user.name.trim()
  return '—'
}

function resolveMethodKind(order: ApiAdminOrder): AdminShippingMethodKind {
  if (order.shipment?.carrierType === 'internal') return 'in_house'
  if (
    order.shipment?.carrierName?.trim() ||
    order.shipment?.carrierType === 'api' ||
    order.shipment?.carrierType === 'known'
  ) {
    return 'courier'
  }
  // Checkout `shipping.methodName` (e.g. "Standard delivery") is not an
  // assigned courier — leave unassigned as unknown.
  return 'unknown'
}

function resolveTrackingOrDriver(order: ApiAdminOrder): string {
  const tracking =
    order.shipment?.trackingNumber?.trim() ||
    order.tracking?.trackingNumber?.trim()
  if (tracking) return tracking
  // List enrichment does not expose driverName — never invent one.
  return '—'
}

export function mapApiOrderToShippingRow(order: ApiAdminOrder): AdminShippingOrderRow {
  const id = String(order._id)
  const methodKind = resolveMethodKind(order)
  return {
    id,
    orderNumber: formatAdminOrderNumber(id),
    customerName: resolveCustomerName(order),
    methodKind,
    carrierName: order.shipment?.carrierName?.trim() || null,
    orderStatus: order.orderStatus,
    statusLabel: order.orderStatusLabel ?? order.orderStatus,
    trackingOrDriver: resolveTrackingOrDriver(order),
  }
}

export function filterCarriersByKeyword(
  carriers: readonly AdminCarrierRow[],
  keyword: string,
): AdminCarrierRow[] {
  const q = keyword.trim().toLowerCase()
  if (!q) return [...carriers]
  return carriers.filter(
    (carrier) =>
      carrier.name.toLowerCase().includes(q) ||
      carrier.code.toLowerCase().includes(q),
  )
}

function resolveDetailMethodKind(
  order: ApiAdminOrder,
  carrierType: AdminCarrierType | null,
): AdminShippingMethodKind {
  if (carrierType === 'internal') return 'in_house'
  if (carrierType === 'api' || carrierType === 'known') return 'courier'
  return resolveMethodKind(order)
}

export function mapApiShipmentDetailToAdmin(
  payload: ApiAdminShipmentDetail,
): AdminShipmentDetail {
  const order = payload.order
  const shipment = payload.shipment
  const id = String(order._id)
  const user = order.user
  const customerName =
    user && typeof user === 'object' && user.name?.trim()
      ? user.name.trim()
      : '—'
  const carrierType = shipment?.carrierType ?? order.shipment?.carrierType ?? null
  const carrierName =
    shipment?.carrierName?.trim() ||
    order.shipment?.carrierName?.trim() ||
    null
  const trackingNumber =
    shipment?.trackingNumber?.trim() ||
    order.shipment?.trackingNumber?.trim() ||
    order.tracking?.trackingNumber?.trim() ||
    null
  const shippingMethodName =
    shipment?.methodSnapshot?.methodName?.trim() ||
    order.shipping?.methodName?.trim() ||
    carrierName ||
    '—'

  return {
    id,
    shipmentId: shipment?._id ? String(shipment._id) : null,
    orderNumber: formatAdminOrderNumber(id),
    createdAt: order.createdAt,
    customerName,
    customerEmail:
      user && typeof user === 'object' ? user.email?.trim() || null : null,
    customerPhone:
      user && typeof user === 'object' ? user.phone?.trim() || null : null,
    customerInitials: customerInitials(customerName === '—' ? '' : customerName),
    orderStatus: order.orderStatus,
    orderStatusLabel: order.orderStatusLabel ?? order.orderStatus,
    carrierName,
    carrierCode:
      shipment?.carrierCode?.trim() || order.shipment?.carrierCode?.trim() || null,
    carrierType,
    methodKind: resolveDetailMethodKind(order, carrierType),
    shippingMethodName,
    trackingNumber,
    driverName: shipment?.driverName?.trim() || null,
    shipmentStatus: shipment?.status ?? order.shipment?.status ?? null,
    shipmentStatusLabel:
      shipment?.providerStateLabel?.trim() ||
      order.shipment?.carrierStatusLabel?.trim() ||
      shipment?.status ||
      order.shipment?.status ||
      null,
    trackingSteps: order.tracking?.steps ?? [],
  }
}

export function formatShipmentCustomerSubtitle(detail: AdminShipmentDetail): string {
  const parts = [detail.customerEmail, detail.customerPhone].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : '—'
}
