// src/components/product/ProductPageContent.tsx
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useParams } from 'react-router-dom'
import { Breadcrumb } from '../ui/Breadcrumb'
import { HOME_PATH, SHOP_PATH } from '../../config/routes'
import { useBrowsingHistory } from '../../hooks/useBrowsingHistory'
import { useProductInteractions } from '../../hooks/useProductInteractions'
import { useProductPageData } from '../../hooks/useProductPageData'
import { AskSpecialistDialog } from './AskSpecialistDialog'
import { MoreFromMACCosmetics } from './MoreFromMACCosmetics'
import { PreviouslyBrowsedRelated } from './PreviouslyBrowsedRelated'
import { ProductHero } from './ProductHero'
import { ProductPageErrorState } from './ProductPageErrorState'
import { RelatedProducts } from './RelatedProducts'
import { QuestionsSafetySection } from './QuestionsSafetySection'
import { ReviewsSection } from './reviews/ReviewsSection'
import { WriteReviewDialog } from './WriteReviewDialog'

function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-8" aria-hidden>
      <div className="h-4 w-64 rounded bg-surface-muted" />
      <div className="h-[480px] rounded-[32px] bg-surface-muted lg:h-[729px]" />
    </div>
  )
}

export function ProductPageContent() {
  const { t } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const {
    loading,
    reviewsLoading,
    reviewsLoadingMore,
    reviewsError,
    faqsError,
    error,
    errorKind,
    product,
    productId,
    faqs,
    reviewsData,
    moreFromBrandProducts,
    relatedProducts,
    brandName,
    hasMoreReviews,
    refreshReviews,
    loadMoreReviews,
    updateReviewHelpful,
  } = useProductPageData(slug)

  const interactions = useProductInteractions({
    productId: productId ?? undefined,
    refreshReviews,
    onReviewLikeUpdated: updateReviewHelpful,
  })

  const { products: previouslyBrowsedProducts, loading: browsedLoading } = useBrowsingHistory(8)

  const relatedBrowsed = useMemo(
    () => previouslyBrowsedProducts.filter((item) => item.id !== productId),
    [previouslyBrowsedProducts, productId],
  )

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
        <ProductPageErrorState kind={errorKind === 'not_found' ? 'not_found' : 'load_error'} />
      </div>
    )
  }

  const productName = `${product.brand} ${product.title}`.trim()

  return (
    <>
      <div className="container-content pb-10 sm:pb-12 lg:pb-20">
        <Breadcrumb
          className="mb-6 mt-4 sm:mb-8 sm:mt-6 lg:mb-10 lg:mt-8"
          items={[
            { label: t('nav.home'), href: HOME_PATH },
            { label: product.categoryName, href: product.categoryHref },
            { label: productName },
          ]}
        />
        <ProductHero
          product={product}
          ratingOverride={reviewsLoading ? 0 : reviewsData.averageRating}
          reviewCountOverride={reviewsLoading ? 0 : reviewsData.totalReviews}
        />
        <QuestionsSafetySection
          faqs={faqs}
          emptyMessage={faqsError ?? undefined}
          onAskSpecialist={interactions.openAskSpecialist}
        />
        <ReviewsSection
          {...reviewsData}
          loading={reviewsLoading}
          loadingMore={reviewsLoadingMore}
          error={reviewsError}
          hasMoreReviews={hasMoreReviews}
          onWriteReview={interactions.openWriteReview}
          onLoadMore={loadMoreReviews}
          onToggleHelpful={interactions.toggleHelpful}
          onDeleteReview={interactions.removeReview}
          pendingReviewId={interactions.pendingReviewId}
        />
      </div>

      <MoreFromMACCosmetics brandName={brandName} products={moreFromBrandProducts} />
      <RelatedProducts products={relatedProducts} />
      <PreviouslyBrowsedRelated products={relatedBrowsed} loading={browsedLoading} />

      <AskSpecialistDialog
        open={interactions.askOpen}
        submitting={interactions.askSubmitting}
        error={interactions.askError}
        onClose={interactions.closeAskSpecialist}
        onSubmit={interactions.submitAskSpecialist}
      />
      <WriteReviewDialog
        open={interactions.writeOpen}
        submitting={interactions.writeSubmitting}
        error={interactions.writeError}
        onClose={interactions.closeWriteReview}
        onSubmit={interactions.submitWriteReview}
      />
    </>
  )
}
