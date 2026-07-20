// src/components/shop/recommended/RecommendedProductsSection.tsx
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getRecommendations } from '../../../api/users'
import { useAuth } from '../../../context/AuthContext'
import { useLandingCatalogContext } from '../../../hooks/useLandingCatalogContext'
import { mapApiProductToRecommendedProduct } from '../../../utils/productDetailMappers'
import { ProductCarousel } from './ProductCarousel'
import { ContentSection } from '../../layout/ContentSection'
import { SectionHeader } from '../../landing/SectionHeader'

export function RecommendedProductsSection() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const { products: catalogProducts, loading: catalogLoading } = useLandingCatalogContext()
  const [recommendedFromApi, setRecommendedFromApi] = useState<
    ReturnType<typeof mapApiProductToRecommendedProduct>[]
  >([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setRecommendedFromApi([])
      setLoadingRecommendations(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoadingRecommendations(true)
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

  const loading = catalogLoading || (isAuthenticated && loadingRecommendations)

  return (
    <ContentSection aria-labelledby="recommended-products-heading">
      <SectionHeader
        id="recommended-products-heading"
        title={t('shop.recommended.title')}
        size="compact"
      />
      {loading ? (
        <div className="h-[280px] animate-pulse rounded-[20px] bg-surface-muted" aria-hidden />
      ) : (
        <ProductCarousel
          products={recommendedProducts}
          ariaLabel={t('shop.recommended.ariaLabel')}
        />
      )}
    </ContentSection>
  )
}
