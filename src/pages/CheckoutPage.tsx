// src/pages/CheckoutPage.tsx
import { Navigate } from 'react-router-dom'
import { PAYMENT_PATH } from '../config/routes'

export function CheckoutPage() {
  return <Navigate to={PAYMENT_PATH} replace />
}
