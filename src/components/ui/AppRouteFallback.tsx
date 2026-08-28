// src/components/ui/AppRouteFallback.tsx
import { useLocation } from 'react-router-dom'
import { ADMIN_PATH } from '../../config/routes'
import { AdminLoadingScreen } from '../admin/layout/AdminLoadingScreen'
import { RouteFallback } from './RouteFallback'

export function AppRouteFallback() {
  const { pathname } = useLocation()

  if (pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`)) {
    return <AdminLoadingScreen />
  }

  return <RouteFallback />
}
