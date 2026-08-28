// src/hooks/useCarrierForm.ts
import { useCallback, useEffect, useState } from 'react'
import { createAdminCarrier, updateAdminCarrier } from '../api/admin/carriers'
import { ApiError } from '../lib/api'
import type {
  AdminCarrierFormErrors,
  AdminCarrierFormValues,
  AdminCarrierRow,
  AdminCarrierType,
} from '../types/adminShipping'
import {
  carrierRowToFormValues,
  emptyCarrierFormValues,
  formValuesToCreateCarrierPayload,
  formValuesToUpdateCarrierPayload,
  mapApiCarrierToAdminRow,
  validateCarrierForm,
} from '../utils/adminShippingFormat'

export type CarrierDrawerMode = 'create' | 'edit'

interface UseCarrierFormOptions {
  open: boolean
  mode: CarrierDrawerMode
  carrier: AdminCarrierRow | null
  onSaved: (carrier: AdminCarrierRow) => void
}

/** Carrier create/update form — type is immutable once created (backend ignores it on PUT). */
export function useCarrierForm({
  open,
  mode,
  carrier,
  onSaved,
}: UseCarrierFormOptions) {
  const [values, setValues] = useState<AdminCarrierFormValues>(
    emptyCarrierFormValues(),
  )
  const [errors, setErrors] = useState<AdminCarrierFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setErrors({})
    setSubmitError(null)
    setValues(
      mode === 'edit' && carrier
        ? carrierRowToFormValues(carrier)
        : emptyCarrierFormValues(),
    )
  }, [open, mode, carrier])

  const setField = useCallback(
    <K extends keyof AdminCarrierFormValues>(
      key: K,
      value: AdminCarrierFormValues[K],
    ) => {
      setValues((previous) => ({ ...previous, [key]: value }))
      setErrors((previous) => {
        const next = { ...previous }
        const errorKey = key as keyof AdminCarrierFormErrors
        if (previous[errorKey]) delete next[errorKey]
        if (key === 'deliveryDaysMin' || key === 'deliveryDaysMax') {
          delete next.deliveryDays
          delete next.deliveryDaysMin
          delete next.deliveryDaysMax
        }
        return next
      })
      setSubmitError(null)
    },
    [],
  )

  const setType = useCallback(
    (type: AdminCarrierType) => {
      if (mode === 'edit') return
      setField('type', type)
    },
    [mode, setField],
  )

  const submit = useCallback(async () => {
    const nextErrors = validateCarrierForm(values, mode)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return false

    setSubmitting(true)
    setSubmitError(null)
    try {
      if (mode === 'create') {
        const response = await createAdminCarrier(
          formValuesToCreateCarrierPayload(values),
        )
        const raw = response.data?.carrier
        if (!raw) throw new ApiError(response.message || 'Unable to create carrier.')
        onSaved(mapApiCarrierToAdminRow(raw))
      } else {
        if (!carrier) throw new ApiError('Carrier not found.')
        const response = await updateAdminCarrier(
          carrier.id,
          formValuesToUpdateCarrierPayload(values, carrier),
        )
        const raw = response.data?.carrier
        if (!raw) throw new ApiError(response.message || 'Unable to update carrier.')
        onSaved(mapApiCarrierToAdminRow(raw))
      }
      return true
    } catch (error) {
      setSubmitError(
        error instanceof ApiError ? error.message : 'Unable to save carrier.',
      )
      return false
    } finally {
      setSubmitting(false)
    }
  }, [carrier, mode, onSaved, values])

  return { values, errors, setField, setType, submitting, submitError, submit }
}
