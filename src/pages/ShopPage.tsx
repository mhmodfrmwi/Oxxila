import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { Footer } from '../components/landing/footer/Footer'
import { SkinConcernSection } from '../components/landing/SkinConcernSection'
import { LandingCatalogProvider } from '../context/LandingCatalogContext'
import { PromoCarouselSection } from '../components/promo-carousel/PromoCarouselSection'
import { BrandStores } from '../components/shop/brand-stores/BrandStores'
import { MoreReasonsSection } from '../components/shop/MoreReasonsSection'
import { RecommendedProductsSection } from '../components/shop/recommended/RecommendedProductsSection'
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
      <LandingCatalogProvider>
        <PageBleed>
          <ShopHeroCarousel />
          <ShopCategoriesStrip />
          <MoreReasonsSection />
          <RecommendedProductsSection />
          <PromoCarouselSection />
          <BrandStores />
          <SkinConcernSection />
          <Footer />
        </PageBleed>
      </LandingCatalogProvider>
    </Layout>
  )
}
