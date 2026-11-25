// src/components/product/RelatedProducts.tsx
import { useTranslation } from 'react-i18next'
import { ContentSection } from '../layout/ContentSection'
import { SectionHeader } from '../landing/SectionHeader'
import { ProductCarousel } from '../shop/recommended/ProductCarousel'
import type { RecommendedProduct } from '../shop/recommended/recommendedProductsData'

/** "You may also like" — server-ranked by shared concerns, sub-category, brand. Public. */
export function RelatedProducts({ products }: { products: readonly RecommendedProduct[] }) {
  const { t } = useTranslation()
  if (products.length === 0) return null

  return (
    <ContentSection tone="tinted" padding="compact" aria-labelledby="related-products-heading">
      <SectionHeader
        id="related-products-heading"
        title={t('productDetail.related.title')}
        subtitle={t('productDetail.related.subtitle')}
        size="compact"
      />
      <ProductCarousel
        products={products}
        showReason
        ariaLabel={t('productDetail.related.title')}
      />
    </ContentSection>
  )
}
