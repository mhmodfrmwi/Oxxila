// src/components/admin/AdminPermissionGate.tsx
import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdminPermissions } from '../../hooks/useAdminPermissions'
import {
  firstAllowedAdminPath,
  resolveAdminTabFromPath,
} from '../../utils/adminPermissions'
import { EmptyState } from './ui/EmptyState'

interface AdminPermissionGateProps {
  children: ReactNode
}

/**
 * Route-level RBAC gate: redirects to the first allowed admin path or shows 403.
 */
export function AdminPermissionGate({ children }: AdminPermissionGateProps) {
  const { pathname } = useLocation()
  const { permissions, canReadTab } = useAdminPermissions()
  const { t } = useTranslation()

  const tab = resolveAdminTabFromPath(pathname)

  if (!tab || canReadTab(tab)) {
    return children
  }

  const fallback = firstAllowedAdminPath(permissions)
  if (fallback && fallback !== pathname) {
    return <Navigate to={fallback} replace />
  }

  return (
    <EmptyState
      bare
      className="py-16"
      title={t('admin.permissionDenied.title')}
      description={t('admin.permissionDenied.description')}
    />
  )
}
