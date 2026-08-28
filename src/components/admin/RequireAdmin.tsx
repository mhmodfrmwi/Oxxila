// src/components/admin/RequireAdmin.tsx
import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { HOME_PATH, LOGIN_PATH } from '../../config/routes'
import { useAuth } from '../../context/AuthContext'
import { AdminLoadingScreen } from './layout/AdminLoadingScreen'

interface RequireAdminProps {
  children: ReactNode
}

function isAdminRole(role: string | undefined): boolean {
  return role?.toLowerCase() === 'admin'
}

/**
 * Gates admin routes: requires an authenticated user with role `admin`.
 * No business data fetching — auth state only.
 */
export function RequireAdmin({ children }: RequireAdminProps) {
  const { isAuthenticated, user, profileLoading } = useAuth()
  const location = useLocation()

  if (profileLoading) {
    return <AdminLoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to={LOGIN_PATH} replace state={{ from: location.pathname }} />
  }

  if (!isAdminRole(user?.role)) {
    return <Navigate to={HOME_PATH} replace />
  }

  return children
}
