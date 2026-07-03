// src/pages/AccountPage.tsx
import { Navigate } from 'react-router-dom'
import { ADDRESSES_PATH } from '../config/routes'

export function AccountPage() {
  return <Navigate to={ADDRESSES_PATH} replace />
}
