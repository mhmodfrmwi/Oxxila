// src/components/product/MoreFromMACCosmetics.tsx
import { useTranslation } from 'react-i18next'
import { ContentSection } from '../layout/ContentSection'
import { SectionHeader } from '../landing/SectionHeader'
import { ProductCarousel } from '../shop/recommended/ProductCarousel'
import type { RecommendedProduct } from '../shop/recommended/recommendedProductsData'

export type Product = RecommendedProduct

export interface MoreFromMACCosmeticsProps {
  brandName: string
  products: readonly Product[]
}

export function MoreFromMACCosmetics({ brandName, products }: MoreFromMACCosmeticsProps) {
  const { t } = useTranslation()

  if (products.length === 0) return null

  const sectionTitle = brandName
    ? t('productDetail.moreFromBrand', { brand: brandName })
    : t('productDetail.moreFromBrandFallback')

  return (
    <ContentSection padding="compact" aria-labelledby="more-from-brand-heading">
      <SectionHeader id="more-from-brand-heading" title={sectionTitle} size="compact" />
      <ProductCarousel products={products} ariaLabel={sectionTitle} />
    </ContentSection>
  )
}
