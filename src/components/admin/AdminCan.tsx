// src/components/admin/AdminCan.tsx
import type { ReactNode } from 'react'
import type { AdminCrudAction, AdminTabKey } from '../../types/adminPermissions'
import { useAdminPermissions } from '../../hooks/useAdminPermissions'

interface AdminCanProps {
  tab: AdminTabKey
  action: AdminCrudAction
  children: ReactNode
  /** Optional fallback when permission is missing. */
  fallback?: ReactNode
}

/** Renders children only when the current admin has `tab.action` permission. */
export function AdminCan({ tab, action, children, fallback = null }: AdminCanProps) {
  const { can } = useAdminPermissions()
  if (!can(tab, action)) return <>{fallback}</>
  return <>{children}</>
}
