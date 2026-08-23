// src/hooks/useReturnActions.ts
import { useCallback, useState } from 'react'
import {
  refundAdminReturn,
  refundReturnAsGift,
  scheduleAdminBostaReturn,
  updateAdminReturnStatus,
} from '../api/admin/returns'
import { ApiError } from '../lib/api'
import type {
  ApproveReturnFormPayload,
  UpdateReturnStatusPayload,
} from '../types/adminReturns'

interface UseReturnActionsOptions {
  returnId: string | null
  /** Called after any successful mutation — reload detail + refresh the list. */
  onMutated: () => void
}

interface ActionState {
  submitting: boolean
  error: string | null
}

/** Result of a mutator call — returned directly (not read off hook state) to avoid stale closures. */
export interface ReturnActionResult {
  ok: boolean
  error: string | null
}

const idleState: ActionState = { submitting: false, error: null }

/** Approve/reject/advance/schedule mutators for a single return request (Milestone 2). */
export function useReturnActions({ returnId, onMutated }: UseReturnActionsOptions) {
  const [approveState, setApproveState] = useState<ActionState>(idleState)
  const [rejectState, setRejectState] = useState<ActionState>(idleState)
  const [advanceState, setAdvanceState] = useState<ActionState>(idleState)
  const [scheduleState, setScheduleState] = useState<ActionState>(idleState)
  const [refundState, setRefundState] = useState<ActionState>(idleState)
  const [refundGiftState, setRefundGiftState] = useState<ActionState>(idleState)

  const resetApproveError = useCallback(() => {
    setApproveState((previous) => (previous.error ? { ...previous, error: null } : previous))
  }, [])

  const resetRejectError = useCallback(() => {
    setRejectState((previous) => (previous.error ? { ...previous, error: null } : previous))
  }, [])

  const approveReturn = useCallback(
    async (payload: ApproveReturnFormPayload): Promise<ReturnActionResult> => {
      if (!returnId) return { ok: false, error: null }
      setApproveState({ submitting: true, error: null })
      try {
        const body: UpdateReturnStatusPayload =
          payload.logisticsHandler === 'bosta'
            ? {
                refundStatus: 'approved',
                logisticsHandler: 'bosta',
                carrierId: payload.carrierId ?? '',
                dropOffPickupId: payload.dropOffPickupId ?? '',
              }
            : { refundStatus: 'approved', logisticsHandler: 'internal' }

        await updateAdminReturnStatus(returnId, body)
        setApproveState(idleState)
        onMutated()
        return { ok: true, error: null }
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to approve return request'
        setApproveState({ submitting: false, error: message })
        return { ok: false, error: message }
      }
    },
    [returnId, onMutated],
  )

  const rejectReturn = useCallback(
    async (adminNote: string): Promise<ReturnActionResult> => {
      if (!returnId) return { ok: false, error: null }
      setRejectState({ submitting: true, error: null })
      try {
        await updateAdminReturnStatus(returnId, { refundStatus: 'rejected', adminNote })
        setRejectState(idleState)
        onMutated()
        return { ok: true, error: null }
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to reject return request'
        setRejectState({ submitting: false, error: message })
        return { ok: false, error: message }
      }
    },
    [returnId, onMutated],
  )

  const advanceReturnStatus = useCallback(
    async (nextStatus: 'picked_up' | 'received'): Promise<ReturnActionResult> => {
      if (!returnId) return { ok: false, error: null }
      setAdvanceState({ submitting: true, error: null })
      try {
        await updateAdminReturnStatus(returnId, { refundStatus: nextStatus })
        setAdvanceState(idleState)
        onMutated()
        return { ok: true, error: null }
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to update return status'
        setAdvanceState({ submitting: false, error: message })
        return { ok: false, error: message }
      }
    },
    [returnId, onMutated],
  )

  const scheduleBostaReturn = useCallback(async (): Promise<ReturnActionResult> => {
    if (!returnId) return { ok: false, error: null }
    setScheduleState({ submitting: true, error: null })
    try {
      await scheduleAdminBostaReturn(returnId)
      setScheduleState(idleState)
      onMutated()
      return { ok: true, error: null }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Unable to schedule Bosta pickup'
      setScheduleState({ submitting: false, error: message })
      return { ok: false, error: message }
    }
  }, [returnId, onMutated])

  const refundReturn = useCallback(async (): Promise<ReturnActionResult> => {
    if (!returnId) return { ok: false, error: null }
    setRefundState({ submitting: true, error: null })
    try {
      await refundAdminReturn(returnId)
      setRefundState(idleState)
      onMutated()
      return { ok: true, error: null }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Unable to refund return request'
      setRefundState({ submitting: false, error: message })
      return { ok: false, error: message }
    }
  }, [returnId, onMutated])

  const refundReturnAsGiftCard = useCallback(async (): Promise<ReturnActionResult> => {
    if (!returnId) return { ok: false, error: null }
    setRefundGiftState({ submitting: true, error: null })
    try {
      await refundReturnAsGift(returnId)
      setRefundGiftState(idleState)
      onMutated()
      return { ok: true, error: null }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Unable to refund return as gift card'
      setRefundGiftState({ submitting: false, error: message })
      return { ok: false, error: message }
    }
  }, [returnId, onMutated])

  return {
    approveSubmitting: approveState.submitting,
    approveError: approveState.error,
    resetApproveError,
    approveReturn,
    rejectSubmitting: rejectState.submitting,
    rejectError: rejectState.error,
    resetRejectError,
    rejectReturn,
    advanceSubmitting: advanceState.submitting,
    advanceError: advanceState.error,
    advanceReturnStatus,
    scheduleSubmitting: scheduleState.submitting,
    scheduleError: scheduleState.error,
    scheduleBostaReturn,
    refundSubmitting: refundState.submitting,
    refundError: refundState.error,
    refundReturn,
    refundGiftSubmitting: refundGiftState.submitting,
    refundGiftError: refundGiftState.error,
    refundReturnAsGift: refundReturnAsGiftCard,
  }
}

export type UseReturnActionsReturn = ReturnType<typeof useReturnActions>
