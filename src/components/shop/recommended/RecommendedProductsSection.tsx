import { useEffect, useMemo, useState } from 'react'
import { getRecommendations } from '../../../api/users'
import { useAuth } from '../../../context/AuthContext'
import { useLandingCatalogContext } from '../../../hooks/useLandingCatalogContext'
import { mapApiProductToRecommendedProduct } from '../../../utils/productDetailMappers'
import { ProductCarousel } from './ProductCarousel'
import { ContentSection } from '../../layout/ContentSection'
import { SectionHeader } from '../../landing/SectionHeader'

export function RecommendedProductsSection() {
  const { isAuthenticated } = useAuth()
  const { products: catalogProducts, loading: catalogLoading } = useLandingCatalogContext()
  const [recommendedFromApi, setRecommendedFromApi] = useState<ReturnType<typeof mapApiProductToRecommendedProduct>[]>([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setRecommendedFromApi([])
      return
    }

    let cancelled = false
    setLoadingRecommendations(true)

    async function load() {
      try {
        const response = await getRecommendations()
        if (cancelled) return
        setRecommendedFromApi((response.data ?? []).map(mapApiProductToRecommendedProduct))
      } catch {
        if (!cancelled) setRecommendedFromApi([])
      } finally {
        if (!cancelled) setLoadingRecommendations(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const recommendedProducts = useMemo(() => {
    if (isAuthenticated && recommendedFromApi.length > 0) return recommendedFromApi
    return catalogProducts.map(mapApiProductToRecommendedProduct)
  }, [isAuthenticated, recommendedFromApi, catalogProducts])

  const loading = catalogLoading || loadingRecommendations

  return (
    <ContentSection aria-labelledby="recommended-products-heading">
      <SectionHeader id="recommended-products-heading" title="Recommended for you" size="compact" />
      {loading ? (
        <div className="h-[280px] animate-pulse rounded-[20px] bg-surface-muted" aria-hidden />
      ) : (
        <ProductCarousel products={recommendedProducts} />
      )}
    </ContentSection>
  )
}
