// src/pages/CollectionPage.tsx
import { Navigate, useParams } from 'react-router-dom'
import { CATEGORIES_PATH } from '../config/routes'
import { getCollectionHref } from '../config/collections'

/** Legacy `/collections/:slug` → Categories listing with collection filters. */
export function CollectionPage() {
  const { slug = '' } = useParams<{ slug: string }>()

  if (!slug) {
    return <Navigate to={CATEGORIES_PATH} replace />
  }

  return <Navigate to={getCollectionHref(slug)} replace />
}
