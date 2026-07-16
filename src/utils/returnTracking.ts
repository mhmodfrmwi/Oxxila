// src/utils/returnTracking.ts
import type { ReturnRefundStatus, ReturnRequest } from '../api/returns'

export const RETURN_TIMELINE_STEPS = [
  { id: 'submitted', status: 'pending' },
  { id: 'approved', status: 'approved' },
  { id: 'picked_up', status: 'picked_up' },
  { id: 'received', status: 'received' },
  { id: 'refunded', status: 'refunded' },
] as const

export type ReturnTimelineStepId = (typeof RETURN_TIMELINE_STEPS)[number]['id']

export type ReturnStepVisual = 'completed' | 'active' | 'upcoming'

const STATUS_STEP_INDEX: Record<ReturnRefundStatus, number> = {
  pending: 0,
  approved: 1,
  picked_up: 2,
  received: 3,
  refunded: 4,
  rejected: 0,
}

export function getReturnOrderId(returnRequest: ReturnRequest): string {
  if (typeof returnRequest.order === 'string') return returnRequest.order
  return returnRequest.order._id
}

export function formatReturnRequestId(id: string): string {
  return `REQ #${id.slice(-8).toUpperCase()}`
}

export function formatReturnDate(iso: string, locale = 'en'): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  if (locale.startsWith('ar')) {
    return date.toLocaleDateString('ar', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }
  const day = date.getDate()
  const month = date.toLocaleDateString('en-GB', { month: 'short' })
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

export function formatReturnRefund(amount: number): string {
  const normalized =
    amount % 1 === 0
      ? amount.toFixed(0)
      : amount.toFixed(2)
  return `${normalized} EGP`
}

export function getReturnTimelineStates(
  refundStatus: ReturnRefundStatus,
): Array<{ id: ReturnTimelineStepId; visual: ReturnStepVisual; indexLabel: string }> {
  const activeIndex = STATUS_STEP_INDEX[refundStatus]
  const isRejected = refundStatus === 'rejected'
  const isFullyComplete = refundStatus === 'refunded'

  return RETURN_TIMELINE_STEPS.map((step, index) => {
    let visual: ReturnStepVisual = 'upcoming'
    if (isFullyComplete) {
      visual = 'completed'
    } else if (isRejected) {
      visual = index === 0 ? 'completed' : 'upcoming'
    } else if (index < activeIndex) {
      visual = 'completed'
    } else if (index === activeIndex) {
      visual = 'active'
    }

    return {
      id: step.id,
      visual,
      indexLabel: String(index + 1).padStart(2, '0'),
    }
  })
}

export function getReturnLogisticsLabel(returnRequest: ReturnRequest): string | null {
  const carrier =
    returnRequest.carrier && typeof returnRequest.carrier === 'object'
      ? returnRequest.carrier.name
      : null
  if (carrier) return carrier
  if (returnRequest.logisticsHandler === 'bosta') return 'Bosta'
  if (returnRequest.logisticsHandler === 'internal') return 'Internal'
  return null
}

export function getReturnTrackingNumber(returnRequest: ReturnRequest): string | null {
  return returnRequest.bostaTrackingNumber?.trim() || null
}

export function getReturnTrackingStatusLabel(returnRequest: ReturnRequest): string | null {
  return (
    returnRequest.bostaStateLabel?.trim() ||
    returnRequest.logisticsNotes?.trim() ||
    null
  )
}
