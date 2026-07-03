// src/pages/AddressesPage.tsx
import { Navigate } from 'react-router-dom'
import { ADD_ADDRESS_PATH } from '../config/routes'

export function AddressesPage() {
  return <Navigate to={ADD_ADDRESS_PATH} replace />
}
