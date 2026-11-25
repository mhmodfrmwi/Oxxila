// src/components/shop/recommended/RecommendedProductsSection.tsx
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getRecommendations } from '../../../api/users'
import type { ApiProduct } from '../../../types/catalog'
import { useAuth } from '../../../context/AuthContext'
import { useLandingCatalogContext } from '../../../hooks/useLandingCatalogContext'
import { mapApiProductToRecommendedProduct } from '../../../utils/productDetailMappers'
import { ProductCarousel } from './ProductCarousel'
import { ContentSection } from '../../layout/ContentSection'
import { SectionHeader } from '../../landing/SectionHeader'

export function RecommendedProductsSection() {
  const { t, i18n } = useTranslation()
  const { isAuthenticated } = useAuth()
  const { products: catalogProducts, loading: catalogLoading } = useLandingCatalogContext()
  const [recommendedFromApi, setRecommendedFromApi] = useState<ApiProduct[]>([])
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
        setRecommendedFromApi(response.data ?? [])
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
    const source =
      isAuthenticated && recommendedFromApi.length > 0 ? recommendedFromApi : catalogProducts
    return source.map((product) =>
      mapApiProductToRecommendedProduct(product, i18n.language),
    )
  }, [isAuthenticated, recommendedFromApi, catalogProducts, i18n.language])

  const loading = catalogLoading || (isAuthenticated && loadingRecommendations)

  return (
    <ContentSection aria-labelledby="recommended-products-heading">
      <SectionHeader
        id="recommended-products-heading"
        title={t('shop.recommended.title')}
        subtitle={
          isAuthenticated && recommendedFromApi.length > 0
            ? t('shop.recommended.subtitlePersonal')
            : t('shop.recommended.subtitleGuest')
        }
        size="compact"
      />
      {loading ? (
        <div className="h-[340px] animate-pulse rounded-medium bg-surface-muted" aria-hidden />
      ) : (
        <ProductCarousel
          products={recommendedProducts}
          showReason={isAuthenticated && recommendedFromApi.length > 0}
          ariaLabel={t('shop.recommended.ariaLabel')}
        />
      )}
    </ContentSection>
  )
}
