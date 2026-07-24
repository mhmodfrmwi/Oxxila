// src/hooks/useOrderAssign.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  assignAdminOrderShipping,
  getAdminOrderShippingDetail,
  updateAdminManualOrderShippingStatus,
} from '../api/admin/shipping'
import { ApiError } from '../lib/api'
import type { ApiAdminOrder } from '../types/adminOrders'
import type {
  AdminAssignShippingBody,
  AdminManualShippingStatus,
  AdminManualShippingStatusBody,
  AdminShippingPackageSize,
  ApiAdminAssignCarrier,
  ApiAdminAssignPickup,
} from '../types/adminShipping'

interface UseOrderAssignOptions {
  open: boolean
  orderId: string | null
  /** Called after a successful assign or manual status update with the fresh enriched order. */
  onOrderUpdated: (order: ApiAdminOrder) => void
}

export interface AssignFormState {
  size: AdminShippingPackageSize
  carrierId: string
  pickupId: string
  driverName: string
  driverPhone: string
  trackingNumber: string
  notes: string
}

export type AssignFormErrors = Partial<Record<keyof AssignFormState, string>>

export type CarrierDisabledReason = 'coverage' | 'pickups' | 'district' | null

const emptyForm = (): AssignFormState => ({
  size: 'MEDIUM',
  carrierId: '',
  pickupId: '',
  driverName: '',
  driverPhone: '',
  trackingNumber: '',
  notes: '',
})

export function isBostaCarrier(carrier: ApiAdminAssignCarrier | null): boolean {
  return carrier?.type === 'api' && carrier.apiProvider === 'bosta'
}

/** Why a carrier radio is disabled — matches the contract's coverage/pickup/district rules. */
export function carrierDisabledReason(
  carrier: ApiAdminAssignCarrier,
  districtCovered: boolean | null,
): CarrierDisabledReason {
  if (!carrier.coversGovernorate) return 'coverage'
  if (isBostaCarrier(carrier)) {
    if (!carrier.hasPickups) return 'pickups'
    if (districtCovered === false) return 'district'
  }
  return null
}

/**
 * Assign-carrier workflow for the Order Details drawer: loads GET
 * /admin/shipping/orders/:id assign context, then drives both the
 * Assign Carrier form and the post-assign manual tracking status update.
 */
export function useOrderAssign({ open, orderId, onOrderUpdated }: UseOrderAssignOptions) {
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [carriers, setCarriers] = useState<ApiAdminAssignCarrier[]>([])
  const [pickupsByCarrier, setPickupsByCarrier] = useState<
    Record<string, ApiAdminAssignPickup[]>
  >({})
  const [districtCovered, setDistrictCovered] = useState<boolean | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  const [form, setForm] = useState<AssignFormState>(emptyForm())
  const [formErrors, setFormErrors] = useState<AssignFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [manualStatus, setManualStatus] = useState<AdminManualShippingStatus>('processing')
  const [manualNotes, setManualNotes] = useState('')
  const [manualSubmitting, setManualSubmitting] = useState(false)
  const [manualError, setManualError] = useState<string | null>(null)

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  useEffect(() => {
    if (!open || !orderId) {
      setCarriers([])
      setPickupsByCarrier({})
      setDistrictCovered(null)
      setForm(emptyForm())
      setFormErrors({})
      setSubmitError(null)
      setLoading(false)
      setLoadError(null)
      return
    }

    const controller = new AbortController()
    const requestId = ++requestIdRef.current
    setLoading(true)
    setLoadError(null)

    void (async () => {
      try {
        const response = await getAdminOrderShippingDetail(orderId, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return
        const data = response.data
        if (!data) {
          setLoading(false)
          setLoadError(response.message || 'Unable to load assign options')
          return
        }
        setCarriers(data.carriers ?? [])
        setPickupsByCarrier(data.pickupsByCarrier ?? {})
        setDistrictCovered(data.districtMeta?.bostaCovered ?? null)
        setLoading(false)
      } catch (error) {
        if (isAbortError(error) || requestId !== requestIdRef.current) return
        setLoading(false)
        setLoadError(
          error instanceof ApiError ? error.message : 'Unable to load assign options',
        )
      }
    })()

    return () => {
      controller.abort()
    }
  }, [open, orderId, reloadToken])

  const selectedCarrier = useMemo(
    () => carriers.find((carrier) => carrier._id === form.carrierId) ?? null,
    [carriers, form.carrierId],
  )
  const isBostaSelected = isBostaCarrier(selectedCarrier)
  const pickupOptions = form.carrierId ? (pickupsByCarrier[form.carrierId] ?? []) : []

  const setField = useCallback(
    <K extends keyof AssignFormState>(key: K, value: AssignFormState[K]) => {
      setForm((previous) => ({ ...previous, [key]: value }))
      setFormErrors((previous) => {
        if (!previous[key]) return previous
        const next = { ...previous }
        delete next[key]
        return next
      })
      setSubmitError(null)
    },
    [],
  )

  const selectCarrier = useCallback((carrierId: string) => {
    setForm((previous) => ({ ...previous, carrierId, pickupId: '' }))
    setFormErrors({})
    setSubmitError(null)
  }, [])

  const submitAssign = useCallback(async () => {
    if (!orderId) return false
    const carrier = carriers.find((c) => c._id === form.carrierId) ?? null
    const isBosta = isBostaCarrier(carrier)

    const errors: AssignFormErrors = {}
    if (!form.carrierId) errors.carrierId = 'carrierRequired'
    else if (isBosta && !form.pickupId) errors.pickupId = 'pickupRequired'
    else if (!isBosta) {
      if (!form.driverName.trim()) errors.driverName = 'driverNameRequired'
      if (!form.driverPhone.trim()) errors.driverPhone = 'driverPhoneRequired'
    }
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return false

    setSubmitting(true)
    setSubmitError(null)
    try {
      const body: AdminAssignShippingBody = isBosta
        ? {
            carrierId: form.carrierId,
            pickupId: form.pickupId,
            size: form.size,
            notes: form.notes.trim() || undefined,
            markShipped: true,
          }
        : {
            carrierId: form.carrierId,
            driverName: form.driverName.trim(),
            driverPhone: form.driverPhone.trim(),
            trackingNumber: form.trackingNumber.trim() || undefined,
            notes: form.notes.trim() || undefined,
            size: form.size,
            markShipped: true,
          }

      const response = await assignAdminOrderShipping(orderId, body)
      const data = response.data
      if (!data) throw new ApiError(response.message || 'Unable to assign carrier')
      onOrderUpdated(data)
      return true
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : 'Unable to assign carrier')
      return false
    } finally {
      setSubmitting(false)
    }
  }, [carriers, form, onOrderUpdated, orderId])

  const submitManualStatus = useCallback(async () => {
    if (!orderId) return false
    setManualSubmitting(true)
    setManualError(null)
    try {
      const body: AdminManualShippingStatusBody = {
        orderStatus: manualStatus,
        notes: manualNotes.trim() || undefined,
      }
      const response = await updateAdminManualOrderShippingStatus(orderId, body)
      const data = response.data
      if (!data) throw new ApiError(response.message || 'Unable to update tracking status')
      onOrderUpdated(data)
      return true
    } catch (error) {
      setManualError(
        error instanceof ApiError ? error.message : 'Unable to update tracking status',
      )
      return false
    } finally {
      setManualSubmitting(false)
    }
  }, [manualNotes, manualStatus, onOrderUpdated, orderId])

  return {
    loading,
    loadError,
    carriers,
    pickupOptions,
    districtCovered,
    reload,
    form,
    formErrors,
    setField,
    selectCarrier,
    selectedCarrier,
    isBostaSelected,
    submitting,
    submitError,
    submitAssign,
    manualStatus,
    setManualStatus,
    manualNotes,
    setManualNotes,
    manualSubmitting,
    manualError,
    submitManualStatus,
  }
}

export type UseOrderAssignReturn = ReturnType<typeof useOrderAssign>
