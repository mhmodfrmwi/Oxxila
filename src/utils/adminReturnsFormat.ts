// src/utils/adminReturnsFormat.ts
import type { StatusBadgeTone } from '../components/admin/ui/StatusBadge'
import type {
  AdminReturnDetail,
  AdminReturnRow,
  AdminReturnsStatusTab,
  AdminReturnStatus,
  ApiAdminReturn,
} from '../types/adminReturns'
import {
  formatDashboardDate,
  formatDashboardMoney,
  formatOrderId,
} from './adminDashboardFormat'

export function formatAdminReturnMoney(value: number, locale = 'en'): string {
  return formatDashboardMoney(value, locale)
}

export function formatAdminReturnDate(value: string, locale = 'en'): string {
  return formatDashboardDate(value, locale)
}

/** Short return reference, e.g. `#RT-4F21`. */
export function formatReturnShortId(id: string): string {
  const cleaned = id.replace(/[^a-zA-Z0-9]/g, '')
  const short = (cleaned.slice(-4) || id.slice(-4)).toUpperCase()
  return `#RT-${short}`
}

/** Short order reference reusing the Orders admin convention, e.g. `#OX-4F21`. */
export function formatReturnOrderLabel(orderId: string): string {
  return formatOrderId(orderId)
}

export function returnStatusBadgeTone(status: AdminReturnStatus): StatusBadgeTone {
  switch (status) {
    case 'refunded':
      return 'success'
    case 'approved':
    case 'picked_up':
    case 'received':
      return 'info'
    case 'pending':
      return 'warning'
    case 'rejected':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function statusTabToRefundStatus(
  tab: AdminReturnsStatusTab,
): AdminReturnStatus | undefined {
  if (tab === 'all') return undefined
  return tab
}

function resolveUser(returnRequest: ApiAdminReturn) {
  const user = returnRequest.user
  return user && typeof user === 'object' ? user : null
}

function resolveOrderId(returnRequest: ApiAdminReturn): string | null {
  const order = returnRequest.order
  if (!order) return null
  if (typeof order === 'string') return order
  return order._id ?? null
}

function resolveOrderPaymentMethod(returnRequest: ApiAdminReturn): 'cod' | 'card' | null {
  const order = returnRequest.order
  if (!order || typeof order === 'string') return null
  return order.paymentMethod ?? null
}

export function mapApiReturnToRow(returnRequest: ApiAdminReturn): AdminReturnRow {
  const id = String(returnRequest._id)
  const user = resolveUser(returnRequest)
  const orderId = resolveOrderId(returnRequest)

  return {
    id,
    shortId: formatReturnShortId(id),
    createdAt: returnRequest.createdAt,
    userName: user?.name?.trim() || '—',
    userEmail: user?.email?.trim() || null,
    orderId,
    orderShortLabel: orderId ? formatReturnOrderLabel(orderId) : null,
    refundAmount: returnRequest.refundAmount,
    refundStatus: returnRequest.refundStatus,
  }
}

function resolveDropOffLocationName(returnRequest: ApiAdminReturn): string | null {
  if (returnRequest.dropOffSnapshot?.locationName?.trim()) {
    return returnRequest.dropOffSnapshot.locationName.trim()
  }
  const dropOffPickup = returnRequest.dropOffPickup
  if (dropOffPickup && typeof dropOffPickup === 'object') {
    return dropOffPickup.locationName?.trim() || null
  }
  return null
}

export function mapApiReturnToDetail(returnRequest: ApiAdminReturn): AdminReturnDetail {
  const id = String(returnRequest._id)
  const user = resolveUser(returnRequest)
  const orderId = resolveOrderId(returnRequest)
  const pickupAddress = returnRequest.pickupAddress

  return {
    id,
    shortId: formatReturnShortId(id),
    createdAt: returnRequest.createdAt,
    refundStatus: returnRequest.refundStatus,
    refundAmount: returnRequest.refundAmount,
    reason: returnRequest.reason,
    note: returnRequest.note?.trim() || '',
    adminNote: returnRequest.adminNote?.trim() || null,
    userName: user?.name?.trim() || '—',
    userEmail: user?.email?.trim() || null,
    userPhone: user?.phone?.trim() || null,
    orderId,
    orderShortLabel: orderId ? formatReturnOrderLabel(orderId) : null,
    logisticsHandler: returnRequest.logisticsHandler ?? null,
    dropOffLocationName: resolveDropOffLocationName(returnRequest),
    bostaExternalId: returnRequest.bostaExternalId?.trim() || null,
    bostaTrackingNumber: returnRequest.bostaTrackingNumber?.trim() || null,
    bostaStateLabel: returnRequest.bostaStateLabel?.trim() || null,
    logisticsScheduledAt: returnRequest.logisticsScheduledAt ?? null,
    orderPaymentMethod: resolveOrderPaymentMethod(returnRequest),
    refundedAt: returnRequest.refundedAt ?? null,
    pickupAddress: pickupAddress
      ? {
          firstLine: pickupAddress.firstLine,
          secondLine: pickupAddress.secondLine?.trim() || null,
          city: pickupAddress.city,
          governorateName: pickupAddress.governorateName,
        }
      : null,
    items: (returnRequest.items ?? []).map((item) => ({
      orderItemId: item.orderItemId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    proofImages: (returnRequest.proofImages ?? []).map((image) => ({ url: image.url })),
  }
}

/** Milestone 2/3 — which action buttons apply to a return's current `refundStatus`. */
export interface ReturnActionAvailability {
  canApprove: boolean
  /** BE allows reject from both `pending` and `approved`. */
  canReject: boolean
  canMarkPickedUp: boolean
  canMarkReceived: boolean
  /** Bosta handler, approved/picked_up, and not yet scheduled. */
  canScheduleBosta: boolean
  /** Milestone 3 — gateway refund once the item has been received back (card orders). */
  canRefundGateway: boolean
  /** Milestone 3 — gift card / store credit refund for COD orders. */
  canRefundAsGift: boolean
}

export function getReturnActionAvailability(detail: AdminReturnDetail): ReturnActionAvailability {
  const { refundStatus, logisticsHandler, bostaExternalId, orderPaymentMethod } = detail
  const received = refundStatus === 'received'
  return {
    canApprove: refundStatus === 'pending',
    canReject: refundStatus === 'pending' || refundStatus === 'approved',
    canMarkPickedUp: refundStatus === 'approved',
    canMarkReceived: refundStatus === 'picked_up',
    canScheduleBosta:
      logisticsHandler === 'bosta' &&
      !bostaExternalId &&
      (refundStatus === 'approved' || refundStatus === 'picked_up'),
    canRefundGateway: received && orderPaymentMethod === 'card',
    canRefundAsGift: received && orderPaymentMethod === 'cod',
  }
}

// --- Milestone 3: status timeline ---

export type ReturnTimelineStepKey =
  | 'pending'
  | 'approved'
  | 'picked_up'
  | 'received'
  | 'refunded'
  | 'rejected'

export interface ReturnTimelineStep {
  key: ReturnTimelineStepKey
  status: 'completed' | 'active' | 'upcoming'
  /** ISO timestamp shown under the step label, when known. */
  timestamp: string | null
}

/** Main happy-path order — `rejected` is a separate terminal branch, not part of this chain. */
const RETURN_TIMELINE_FLOW: readonly ReturnTimelineStepKey[] = [
  'pending',
  'approved',
  'picked_up',
  'received',
  'refunded',
]

/**
 * Builds the lifecycle timeline for the details panel — highlights the current step and
 * branches to a terminal `rejected` step when the return was declined.
 */
export function getReturnTimelineSteps(detail: AdminReturnDetail): ReturnTimelineStep[] {
  if (detail.refundStatus === 'rejected') {
    return [
      { key: 'pending', status: 'completed', timestamp: detail.createdAt },
      { key: 'rejected', status: 'active', timestamp: null },
    ]
  }

  const currentIndex = RETURN_TIMELINE_FLOW.indexOf(detail.refundStatus)

  return RETURN_TIMELINE_FLOW.map((key, index) => {
    const status: ReturnTimelineStep['status'] =
      index < currentIndex ? 'completed' : index === currentIndex ? 'active' : 'upcoming'

    const timestamp =
      key === 'pending'
        ? detail.createdAt
        : key === 'picked_up'
          ? detail.logisticsScheduledAt
          : key === 'refunded'
            ? detail.refundedAt
            : null

    return { key, status, timestamp }
  })
}
