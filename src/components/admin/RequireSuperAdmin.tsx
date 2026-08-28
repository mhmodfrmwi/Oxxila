// src/components/admin/RequireSuperAdmin.tsx
import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { ADMIN_DASHBOARD_PATH } from '../../config/routes'
import { useAdminPermissions } from '../../hooks/useAdminPermissions'

interface RequireSuperAdminProps {
  children: ReactNode
}

/** Gates Super Admin-only routes (e.g. activity log). */
export function RequireSuperAdmin({ children }: RequireSuperAdminProps) {
  const { isSuperAdmin } = useAdminPermissions()

  if (!isSuperAdmin) {
    return <Navigate to={ADMIN_DASHBOARD_PATH} replace />
  }

  return children
}
