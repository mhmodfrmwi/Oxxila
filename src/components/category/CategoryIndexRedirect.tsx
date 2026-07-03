import { Navigate } from 'react-router-dom'
import { CATEGORIES_PATH } from '../../config/routes'
import { useLandingCatalogContext } from '../../hooks/useLandingCatalogContext'
import { resolveDefaultCategorySlug } from '../category/categoryData'

export function CategoryIndexRedirect() {
  const { categories, loading } = useLandingCatalogContext()
  const defaultSlug = resolveDefaultCategorySlug(categories)

  if (loading) {
    return (
      <div className="container-content py-12">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-muted" aria-hidden />
      </div>
    )
  }

  if (!defaultSlug) {
    return (
      <div className="container-content py-12">
        <p className="text-center text-sm text-secondary-text">No categories available.</p>
      </div>
    )
  }

  return <Navigate to={`${CATEGORIES_PATH}/${defaultSlug}`} replace />
}
