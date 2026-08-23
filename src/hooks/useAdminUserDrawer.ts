// src/hooks/useAdminUserDrawer.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createAdminUser,
  getAdminUser,
  updateAdminUser,
} from '../api/admin/admins'
import { getAdminRoles } from '../api/admin/adminRoles'
import { ApiError } from '../lib/api'
import type { ApiAdminRole } from '../types/adminPermissions'
import type {
  AdminUserFormErrors,
  AdminUserFormValues,
  AdminUserRow,
} from '../types/adminUsers'
import {
  adminToFormValues,
  emptyAdminFormValues,
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
  mapApiAdminToRow,
  validateAdminForm,
} from '../utils/adminUsersFormat'

export type AdminUserDrawerMode = 'create' | 'edit'

interface UseAdminUserDrawerOptions {
  open: boolean
  mode: AdminUserDrawerMode
  adminId: string | null
  isSelf?: boolean
  onSaved: (admin: AdminUserRow) => void
}

export function useAdminUserDrawer({
  open,
  mode,
  adminId,
  isSelf = false,
  onSaved,
}: UseAdminUserDrawerOptions) {
  const [values, setValues] = useState<AdminUserFormValues>(
    emptyAdminFormValues(),
  )
  const [errors, setErrors] = useState<AdminUserFormErrors>({})
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [roles, setRoles] = useState<ApiAdminRole[]>([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const baselineRef = useRef<string>('')
  const requestIdRef = useRef(0)

  const resetForm = useCallback((next: AdminUserFormValues) => {
    setValues(next)
    setErrors({})
    setSubmitError(null)
    setDirty(false)
    baselineRef.current = JSON.stringify(next)
  }, [])

  useEffect(() => {
    if (!open) {
      resetForm(emptyAdminFormValues())
      setLoading(false)
      setLoadError(null)
      setRoles([])
      return
    }

    const controller = new AbortController()
    void (async () => {
      setRolesLoading(true)
      try {
        const response = await getAdminRoles({ signal: controller.signal })
        setRoles(response.data ?? [])
      } catch (error) {
        if (!isAbortError(error)) {
          setRoles([])
        }
      } finally {
        setRolesLoading(false)
      }
    })()

    if (mode === 'create') {
      resetForm(emptyAdminFormValues())
      setLoading(false)
      setLoadError(null)
    }

    return () => {
      controller.abort()
    }
  }, [open, mode, resetForm])

  useEffect(() => {
    if (!open || mode !== 'edit') return
    if (!adminId) {
      setLoadError('Admin not found')
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const requestId = ++requestIdRef.current
    setLoading(true)
    setLoadError(null)

    void (async () => {
      try {
        const response = await getAdminUser(adminId, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return
        const data = response.data
        if (!data) {
          setLoading(false)
          setLoadError(response.message || 'Admin not found')
          return
        }
        resetForm(adminToFormValues(data))
        setLoading(false)
      } catch (error) {
        if (isAbortError(error) || requestId !== requestIdRef.current) return
        setLoading(false)
        setLoadError(
          error instanceof ApiError
            ? error.message
            : 'Unable to load admin.',
        )
      }
    })()

    return () => {
      controller.abort()
    }
  }, [open, mode, adminId, resetForm])

  const setField = useCallback(
    <K extends keyof AdminUserFormValues>(
      key: K,
      value: AdminUserFormValues[K],
    ) => {
      setValues((previous) => {
        const next = { ...previous, [key]: value }
        setDirty(JSON.stringify(next) !== baselineRef.current)
        return next
      })
      setErrors((previous) => {
        if (!previous[key]) return previous
        const next = { ...previous }
        delete next[key]
        return next
      })
      setSubmitError(null)
    },
    [],
  )

  const submit = useCallback(async () => {
    const nextErrors = validateAdminForm(values, mode)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return false

    if (mode === 'edit' && isSelf && values.active === false) {
      setSubmitError('You cannot lock or disable your own account.')
      return false
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      if (mode === 'create') {
        const response = await createAdminUser(
          formValuesToCreatePayload(values),
        )
        const data = response.data
        if (!data) {
          throw new ApiError(response.message || 'Unable to create admin.')
        }
        onSaved(mapApiAdminToRow(data))
      } else {
        if (!adminId) throw new ApiError('Admin not found')
        const response = await updateAdminUser(
          adminId,
          formValuesToUpdatePayload(values),
        )
        const data = response.data
        if (!data) {
          throw new ApiError(response.message || 'Unable to update admin.')
        }
        onSaved(mapApiAdminToRow(data))
      }
      setDirty(false)
      return true
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : 'Unable to save admin.',
      )
      return false
    } finally {
      setSubmitting(false)
    }
  }, [adminId, isSelf, mode, onSaved, values])

  return {
    values,
    errors,
    loading,
    loadError,
    submitting,
    submitError,
    dirty,
    roles,
    rolesLoading,
    setField,
    submit,
  }
}
