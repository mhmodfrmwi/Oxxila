// src/components/shop/brand-stores/BrandStores.tsx
import { useMemo } from 'react'
import { useLandingCatalogContext } from '../../../hooks/useLandingCatalogContext'
import { mapBrandsToStores } from '../../../utils/brandMappers'
import { ContentSection } from '../../layout/ContentSection'
import { SectionHeader } from '../../landing/SectionHeader'
import { BrandGrid } from './BrandGrid'

function BrandGridSkeleton() {
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5" aria-hidden>
      {Array.from({ length: 8 }).map((_, index) => (
        <li key={index}>
          <div className="h-[4.5rem] animate-pulse rounded-2xl bg-surface-muted sm:h-[4.75rem]" />
        </li>
      ))}
    </ul>
  )
}

export function BrandStores() {
  const { brands, loading, error } = useLandingCatalogContext()
  const brandStores = useMemo(() => mapBrandsToStores(brands), [brands])

  return (
    <ContentSection aria-labelledby="brand-stores-heading">
      <SectionHeader id="brand-stores-heading" title="Official brand stores" size="compact" />
      {loading ? (
        <BrandGridSkeleton />
      ) : error ? (
        <p className="py-6 text-center text-sm text-support-error" role="alert">
          {error}
        </p>
      ) : brandStores.length === 0 ? (
        <p className="py-6 text-center text-sm text-secondary-text" role="status">
          No brands available right now.
        </p>
      ) : (
        <BrandGrid brands={brandStores} />
      )}
    </ContentSection>
  )
}
