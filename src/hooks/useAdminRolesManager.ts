// src/hooks/useAdminRolesManager.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  createAdminRole,
  deleteAdminRole,
  getAdminRole,
  getAdminRoleTabs,
  getAdminRoles,
  updateAdminRole,
  type AdminRoleWritePayload,
} from '../api/admin/adminRoles'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../lib/api'
import type {
  AdminCrudAction,
  AdminPermissionsMap,
  AdminTabKey,
  ApiAdminRole,
  ApiAdminRoleTabMeta,
} from '../types/adminPermissions'
import {
  buildFullPermissions,
  emptyCrud,
  isSuperAdminRole,
  normalizePermissions,
} from '../utils/adminPermissions'

export type AdminRoleDrawerMode = 'create' | 'edit'

export interface AdminRoleFormValues {
  name: string
  description: string
  permissions: AdminPermissionsMap
}

export type AdminRoleFormErrors = Partial<
  Record<'name' | 'description', string>
>

export interface AdminRoleRow {
  id: string
  name: string
  slug: string
  description: string
  isSystem: boolean
}

function mapRoleToRow(role: ApiAdminRole): AdminRoleRow {
  return {
    id: String(role._id),
    name: role.name,
    slug: role.slug,
    description: role.description ?? '',
    isSystem: Boolean(role.isSystem),
  }
}

export function emptyAdminRoleFormValues(): AdminRoleFormValues {
  const permissions = {} as AdminPermissionsMap
  for (const key of Object.keys(buildFullPermissions()) as AdminTabKey[]) {
    permissions[key] = emptyCrud()
  }
  return {
    name: '',
    description: '',
    permissions,
  }
}

export function roleToFormValues(role: ApiAdminRole): AdminRoleFormValues {
  return {
    name: role.name,
    description: role.description ?? '',
    permissions: normalizePermissions(role.permissions),
  }
}

export function validateAdminRoleForm(
  values: AdminRoleFormValues,
): AdminRoleFormErrors {
  const errors: AdminRoleFormErrors = {}
  const name = values.name.trim()

  if (!name) {
    errors.name = 'Role name is required'
  } else if (name.length < 2 || name.length > 60) {
    errors.name = 'Role name must be 2-60 characters'
  }

  if (values.description.trim().length > 500) {
    errors.description = 'Description cannot exceed 500 characters'
  }

  return errors
}

export function formValuesToRolePayload(
  values: AdminRoleFormValues,
): AdminRoleWritePayload {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    permissions: normalizePermissions(values.permissions),
  }
}

interface UseAdminRolesManagerResult {
  roles: AdminRoleRow[]
  tabMeta: ApiAdminRoleTabMeta[]
  loading: boolean
  error: string | null
  deletingId: string | null
  reload: () => void
  removeRole: (roleId: string) => Promise<boolean>
}

export function useAdminRolesManager(): UseAdminRolesManagerResult {
  const { t } = useTranslation()
  const toast = useToast()
  const [roles, setRoles] = useState<AdminRoleRow[]>([])
  const [tabMeta, setTabMeta] = useState<ApiAdminRoleTabMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    setLoading(true)
    setError(null)

    void (async () => {
      try {
        const [rolesResponse, tabsResponse] = await Promise.all([
          getAdminRoles({ signal: controller.signal }),
          getAdminRoleTabs({ signal: controller.signal }),
        ])
        if (requestId !== requestIdRef.current) return

        setRoles((rolesResponse.data ?? []).map(mapRoleToRow))
        setTabMeta(tabsResponse.data ?? [])
        setLoading(false)
      } catch (err) {
        if (isAbortError(err) || requestId !== requestIdRef.current) return
        setLoading(false)
        setError(
          err instanceof ApiError
            ? err.message
            : t('admin.roles.loadErrorTitle'),
        )
      }
    })()

    return () => {
      controller.abort()
    }
  }, [reloadToken, t])

  const removeRole = useCallback(
    async (roleId: string) => {
      setDeletingId(roleId)
      try {
        await deleteAdminRole(roleId)
        setRoles((previous) => previous.filter((role) => role.id !== roleId))
        toast.success(t('admin.roles.deleteSuccess'))
        return true
      } catch (err) {
        toast.error(
          err instanceof ApiError
            ? err.message
            : t('admin.roles.deleteError'),
        )
        return false
      } finally {
        setDeletingId(null)
      }
    },
    [t, toast],
  )

  return {
    roles,
    tabMeta,
    loading,
    error,
    deletingId,
    reload,
    removeRole,
  }
}

interface UseAdminRoleDrawerOptions {
  open: boolean
  mode: AdminRoleDrawerMode
  roleId: string | null
  tabMeta: readonly ApiAdminRoleTabMeta[]
  onSaved: (role: AdminRoleRow) => void
}

export function useAdminRoleDrawer({
  open,
  mode,
  roleId,
  tabMeta,
  onSaved,
}: UseAdminRoleDrawerOptions) {
  const [values, setValues] = useState<AdminRoleFormValues>(
    emptyAdminRoleFormValues(),
  )
  const [errors, setErrors] = useState<AdminRoleFormErrors>({})
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSystemRole, setIsSystemRole] = useState(false)
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (!open) {
      setValues(emptyAdminRoleFormValues())
      setErrors({})
      setLoadError(null)
      setSubmitError(null)
      setIsSystemRole(false)
      setLoading(false)
      return
    }

    if (mode === 'create') {
      setValues(emptyAdminRoleFormValues())
      setErrors({})
      setLoadError(null)
      setSubmitError(null)
      setIsSystemRole(false)
      setLoading(false)
      return
    }

    if (!roleId) {
      setLoadError('Role not found')
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const requestId = ++requestIdRef.current
    setLoading(true)
    setLoadError(null)

    void (async () => {
      try {
        const response = await getAdminRole(roleId, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return

        const data = response.data
        if (!data) {
          setLoadError(response.message || 'Role not found')
          setLoading(false)
          return
        }

        setValues(roleToFormValues(data))
        setIsSystemRole(isSuperAdminRole(data))
        setLoading(false)
      } catch (err) {
        if (isAbortError(err) || requestId !== requestIdRef.current) return
        setLoading(false)
        setLoadError(
          err instanceof ApiError
            ? err.message
            : 'Unable to load role.',
        )
      }
    })()

    return () => {
      controller.abort()
    }
  }, [open, mode, roleId])

  const setField = useCallback(
    <K extends keyof AdminRoleFormValues>(
      key: K,
      value: AdminRoleFormValues[K],
    ) => {
      setValues((previous) => ({ ...previous, [key]: value }))
      setErrors((previous) => {
        if (!previous[key as keyof AdminRoleFormErrors]) return previous
        const next = { ...previous }
        delete next[key as keyof AdminRoleFormErrors]
        return next
      })
      setSubmitError(null)
    },
    [],
  )

  const togglePermission = useCallback(
    (tab: AdminTabKey, action: AdminCrudAction, checked: boolean) => {
      setValues((previous) => ({
        ...previous,
        permissions: {
          ...previous.permissions,
          [tab]: {
            ...previous.permissions[tab],
            [action]: checked,
          },
        },
      }))
      setSubmitError(null)
    },
    [],
  )

  const submit = useCallback(async () => {
    const nextErrors = validateAdminRoleForm(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return false

    setSubmitting(true)
    setSubmitError(null)

    try {
      const payload = formValuesToRolePayload(values)

      if (mode === 'create') {
        const response = await createAdminRole(payload)
        const data = response.data
        if (!data) {
          throw new ApiError(response.message || 'Unable to create role.')
        }
        onSaved(mapRoleToRow(data))
      } else {
        if (!roleId) throw new ApiError('Role not found')
        const response = await updateAdminRole(roleId, payload)
        const data = response.data
        if (!data) {
          throw new ApiError(response.message || 'Unable to update role.')
        }
        onSaved(mapRoleToRow(data))
      }

      return true
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : 'Unable to save role.',
      )
      return false
    } finally {
      setSubmitting(false)
    }
  }, [mode, onSaved, roleId, values])

  return {
    values,
    errors,
    loading,
    loadError,
    submitting,
    submitError,
    isSystemRole,
    tabMeta,
    setField,
    togglePermission,
    submit,
  }
}
