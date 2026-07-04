// src/pages/CategoryPage.tsx
import { Navigate, useParams } from 'react-router-dom'
import { CATEGORIES_PATH } from '../config/routes'
import { categoryBrowsePath } from '../utils/categoryBrowseParams'

/** Legacy `/categories/:slug` → Categories listing with that category filter. */
export function CategoryPage() {
  const { slug = '' } = useParams<{ slug: string }>()

  if (!slug) {
    return <Navigate to={CATEGORIES_PATH} replace />
  }

  return <Navigate to={categoryBrowsePath(slug)} replace />
}
