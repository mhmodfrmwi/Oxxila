import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { Footer } from '../components/landing/footer/Footer'
import { SkinConcernSection } from '../components/landing/SkinConcernSection'
import { PromoCarouselSection } from '../components/promo-carousel/PromoCarouselSection'
import { BrandStores } from '../components/shop/brand-stores/BrandStores'
import { MoreReasonsSection } from '../components/shop/MoreReasonsSection'
import { RecommendedProductsSection } from '../components/shop/recommended/RecommendedProductsSection'
import { PreviouslyBrowsedProductsSection } from '../components/shop/previously-browsed/PreviouslyBrowsedProductsSection'
import { ShopCategoriesStrip } from '../components/shop/ShopCategoriesStrip'
import { ShopHeroCarousel } from '../components/shop/ShopHeroCarousel'

export function ShopPage() {
  return (
    <Layout
      utilityPromo={{
        title: 'Return within 20 days',
        subtitle: 'from purchase date',
      }}
    >
      <PageBleed>
        <ShopHeroCarousel />
        <ShopCategoriesStrip />
        <MoreReasonsSection />
        <RecommendedProductsSection />
        <PreviouslyBrowsedProductsSection />
        <PromoCarouselSection />
        <BrandStores />
        <SkinConcernSection />
        <Footer />
      </PageBleed>
    </Layout>
  )
}
