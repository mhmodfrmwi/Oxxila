import { Navigate, useParams } from 'react-router-dom'
import { Breadcrumb } from '../ui/Breadcrumb'
import { HOME_PATH, SHOP_PATH } from '../../config/routes'
import { useBrowsingHistory } from '../../hooks/useBrowsingHistory'
import { useProductPageData } from '../../hooks/useProductPageData'
import { MoreFromMACCosmetics } from './MoreFromMACCosmetics'
import { PreviouslyBrowsedRelated } from './PreviouslyBrowsedRelated'
import { ProductHero } from './ProductHero'
import { QuestionsSafetySection } from './QuestionsSafetySection'
import { ReviewsSection } from './reviews/ReviewsSection'

function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-8" aria-hidden>
      <div className="h-4 w-64 rounded bg-surface-muted" />
      <div className="h-[480px] rounded-[32px] bg-surface-muted lg:h-[729px]" />
    </div>
  )
}

export function ProductPageContent() {
  const { slug } = useParams<{ slug: string }>()
  const {
    loading,
    reviewsLoading,
    error,
    errorKind,
    product,
    brandName,
    faqs,
    reviewsData,
    moreFromBrandProducts,
  } = useProductPageData(slug)

  const { products: previouslyBrowsedProducts } = useBrowsingHistory(6)

  if (!slug) {
    return <Navigate to={SHOP_PATH} replace />
  }

  if (loading) {
    return (
      <div className="container-content pb-10 sm:pb-12 lg:pb-20">
        <ProductDetailSkeleton />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container-content pb-10 sm:pb-12 lg:pb-20">
        <p className="text-sm text-support-error" role="alert">
          {errorKind === 'not_found'
            ? 'Product not found.'
            : error ?? 'Unable to load product details.'}
        </p>
      </div>
    )
  }

  const productName = `${product.brand} ${product.title}`.trim()

  return (
    <>
      <div className="container-content pb-10 sm:pb-12 lg:pb-20">
        <Breadcrumb
          className="mb-6 sm:mb-8 lg:mb-10"
          items={[
            { label: 'Home', href: HOME_PATH },
            { label: product.categoryName, href: product.categoryHref },
            { label: productName },
          ]}
        />
        <ProductHero product={product} />
        <QuestionsSafetySection faqs={faqs} />
        <ReviewsSection {...reviewsData} loading={reviewsLoading} />
      </div>

      <MoreFromMACCosmetics brandName={brandName} products={moreFromBrandProducts} />
      <PreviouslyBrowsedRelated products={previouslyBrowsedProducts} />
    </>
  )
}
