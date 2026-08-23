// src/hooks/useAdminPermissions.ts
import { useCallback, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import type {
  AdminCrudAction,
  AdminPermissionsMap,
  AdminTabKey,
} from '../types/adminPermissions'
import {
  can as checkCan,
  canReadTab as checkCanReadTab,
  isSuperAdminRole,
  resolveAdminPermissions,
} from '../utils/adminPermissions'

export function useAdminPermissions() {
  const { user } = useAuth()

  const permissions = useMemo<AdminPermissionsMap | null>(
    () => resolveAdminPermissions(user),
    [user],
  )

  const isSuperAdmin = useMemo(
    () => isSuperAdminRole(user?.adminRole),
    [user?.adminRole],
  )

  const can = useCallback(
    (tab: AdminTabKey, action: AdminCrudAction) =>
      checkCan(permissions, tab, action),
    [permissions],
  )

  const canReadTab = useCallback(
    (tab: AdminTabKey) => checkCanReadTab(permissions, tab),
    [permissions],
  )

  return {
    permissions,
    can,
    canReadTab,
    isSuperAdmin,
  }
}
