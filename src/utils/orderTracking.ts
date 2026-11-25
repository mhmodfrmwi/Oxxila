// src/utils/orderTracking.ts
import type { ApiOrder, ApiOrderTrackingStep } from '../types/order'

export type OrderStatusDisplayState = 'completed' | 'active' | 'upcoming'

export type StepperIconKey =
  | 'approved'
  | 'confirmed'
  | 'processing'
  | 'shipping'
  | 'delivery'

export interface OrderStatusDisplayStep {
  key: string
  label: string
  status: OrderStatusDisplayState
  iconKey: StepperIconKey
}

const CONFIRMATION_STEP_GROUPS = [
  {
    key: 'processing',
    label: 'processing',
    iconKey: 'processing' as const,
    sourceKeys: ['placed', 'handed_over'],
  },
  {
    key: 'shipping',
    label: 'Shipping',
    iconKey: 'shipping' as const,
    sourceKeys: ['in_transit'],
  },
  {
    key: 'delivery',
    label: 'Delivery',
    iconKey: 'delivery' as const,
    sourceKeys: ['delivered'],
  },
] as const

const TRACK_STEP_GROUPS = [
  { key: 'approved', label: 'Approved', iconKey: 'approved' as const, sourceKeys: [] as string[] },
  { key: 'confirmed', label: 'Confirmed', iconKey: 'confirmed' as const, sourceKeys: ['placed'] },
  { key: 'processing', label: 'processing', iconKey: 'processing' as const, sourceKeys: ['handed_over'] },
  { key: 'shipping', label: 'Shipping', iconKey: 'shipping' as const, sourceKeys: ['in_transit'] },
  { key: 'delivery', label: 'Delivery', iconKey: 'delivery' as const, sourceKeys: ['delivered'] },
] as const

const ORDER_STATUS_FALLBACK_PHASE: Record<string, string> = {
  pending: 'processing',
  confirmed: 'processing',
  processing: 'processing',
  shipped: 'shipping',
  out_for_delivery: 'shipping',
  failed_attempt: 'shipping',
  delivered: 'delivery',
  returned: 'processing',
  cancelled: 'processing',
}

const TRACK_STATUS_ACTIVE_INDEX: Record<string, number> = {
  pending: 1,
  confirmed: 2,
  processing: 2,
  shipped: 3,
  out_for_delivery: 3,
  failed_attempt: 3,
  delivered: 4,
  returned: 2,
  cancelled: 0,
}

function resolveGroupStatus(steps: ApiOrderTrackingStep[], sourceKeys: readonly string[]) {
  const relevant = steps.filter((step) => sourceKeys.includes(step.key))
  if (relevant.length === 0) return 'upcoming' as const

  if (relevant.some((step) => step.status === 'active')) return 'active' as const
  if (relevant.every((step) => step.status === 'completed')) return 'completed' as const
  if (relevant.some((step) => step.status === 'completed')) return 'active' as const

  return 'upcoming' as const
}

function isPaymentApproved(order: ApiOrder) {
  return order.paymentStatus === 'paid' || order.paymentMethod === 'cod'
}

function resolveApprovedStatus(order: ApiOrder, activeIndex: number) {
  if (isPaymentApproved(order)) return 'completed' as const
  if (activeIndex === 0) return 'active' as const
  return 'upcoming' as const
}

export function getOrderTrackingNumber(order: ApiOrder): string | null {
  const value = order.tracking?.trackingNumber ?? order.shipment?.trackingNumber ?? null
  return value?.trim() ? value : null
}

export function getOrderStatusDisplaySteps(order: ApiOrder): OrderStatusDisplayStep[] {
  const backendSteps = order.tracking?.steps ?? []

  if (backendSteps.length === 0) {
    const phase = ORDER_STATUS_FALLBACK_PHASE[order.orderStatus] ?? 'processing'
    const activeIndex = CONFIRMATION_STEP_GROUPS.findIndex((group) => group.key === phase)

    return CONFIRMATION_STEP_GROUPS.map((group, index) => ({
      key: group.key,
      label: group.label,
      iconKey: group.iconKey,
      status:
        index < activeIndex
          ? 'completed'
          : index === activeIndex
            ? 'active'
            : 'upcoming',
    }))
  }

  return CONFIRMATION_STEP_GROUPS.map((group) => ({
    key: group.key,
    label: group.label,
    iconKey: group.iconKey,
    status: resolveGroupStatus(backendSteps, group.sourceKeys),
  }))
}

export function getTrackOrderStatusSteps(order: ApiOrder): OrderStatusDisplayStep[] {
  const backendSteps = order.tracking?.steps ?? []
  const fallbackActiveIndex = TRACK_STATUS_ACTIVE_INDEX[order.orderStatus] ?? 1

  if (backendSteps.length === 0) {
    return TRACK_STEP_GROUPS.map((group, index) => ({
      key: group.key,
      label: group.label,
      iconKey: group.iconKey,
      status:
        group.key === 'approved'
          ? resolveApprovedStatus(order, fallbackActiveIndex)
          : index < fallbackActiveIndex
            ? 'completed'
            : index === fallbackActiveIndex
              ? 'active'
              : 'upcoming',
    }))
  }

  return TRACK_STEP_GROUPS.map((group) => {
    if (group.key === 'approved') {
      return {
        key: group.key,
        label: group.label,
        iconKey: group.iconKey,
        status: resolveApprovedStatus(order, fallbackActiveIndex),
      }
    }

    return {
      key: group.key,
      label: group.label,
      iconKey: group.iconKey,
      status: resolveGroupStatus(backendSteps, group.sourceKeys),
    }
  })
}

/** Buyer cancel: trust the server flag; fall back to the statuses it allows for older payloads. */
export function canCancelOrder(order: Pick<ApiOrder, 'orderStatus' | 'canCancel'>) {
  if (typeof order.canCancel === 'boolean') return order.canCancel
  return ['pending', 'confirmed', 'processing'].includes(order.orderStatus)
}

/** Delivered and still inside the return window (server-computed; false when unknown). */
export function canReturnOrder(order: Pick<ApiOrder, 'canReturn'>) {
  return order.canReturn === true
}

export type TrackBannerTone = 'info' | 'success' | 'warning' | 'danger' | 'muted'

/**
 * What the track-page banner says for each order status. Keys resolve under
 * `checkout.track.banner.<key>` (title/subtitle); `useNote` means the subtitle is the
 * dashboard-managed delivery note instead of fixed copy.
 */
export function getTrackBanner(order: Pick<ApiOrder, 'orderStatus'>): {
  key: string
  tone: TrackBannerTone
  useNote: boolean
  showTracking: boolean
} {
  switch (order.orderStatus) {
    case 'pending':
    case 'confirmed':
      return { key: 'received', tone: 'info', useNote: true, showTracking: false }
    case 'processing':
      return { key: 'preparing', tone: 'info', useNote: true, showTracking: false }
    case 'shipped':
    case 'out_for_delivery':
      return { key: 'onItsWay', tone: 'info', useNote: false, showTracking: true }
    case 'failed_attempt':
      return { key: 'failedAttempt', tone: 'warning', useNote: false, showTracking: true }
    case 'delivered':
      return { key: 'delivered', tone: 'success', useNote: false, showTracking: false }
    case 'partially_returned':
    case 'returned':
      return { key: 'returned', tone: 'muted', useNote: false, showTracking: false }
    case 'cancelled':
      return { key: 'cancelled', tone: 'danger', useNote: false, showTracking: false }
    default:
      return { key: 'received', tone: 'info', useNote: true, showTracking: false }
  }
}

export type OrderStatusBadgeTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'

/** Visual tone for storefront order-status chips. */
export function orderStatusBadgeTone(
  status: string,
): OrderStatusBadgeTone {
  switch (status) {
    case 'delivered':
      return 'success'
    case 'cancelled':
    case 'returned':
    case 'partially_returned':
      return 'danger'
    case 'shipped':
    case 'out_for_delivery':
      return 'info'
    case 'failed_attempt':
      return 'warning'
    case 'pending':
    case 'confirmed':
    case 'processing':
      return 'warning'
    default:
      return 'neutral'
  }
}

export function paymentStatusBadgeTone(
  status: string,
): OrderStatusBadgeTone {
  switch (status) {
    case 'paid':
      return 'success'
    case 'refunded':
      return 'info'
    case 'pending':
      return 'warning'
    default:
      return 'neutral'
  }
}

export function formatOrderReferenceId(order: ApiOrder) {
  return `OX-${order._id.slice(-5).toUpperCase()}`
}
