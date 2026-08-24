// src/pages/AboutPage.tsx
import { Navigate } from 'react-router-dom'
import { DOCS_PATH } from '../config/routes'

/** Legacy `/about` — storefront About now lives on `/docs`. */
export function AboutPage() {
  return <Navigate to={DOCS_PATH} replace />
}
