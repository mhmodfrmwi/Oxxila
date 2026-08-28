// src/pages/ProductPage.tsx
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { ProductPageContent } from '../components/product/ProductPageContent'
import { Footer } from '../components/landing/footer/Footer'

export function ProductPage() {
  return (
    <Layout>
      <PageBleed>
        <ProductPageContent />
        <Footer />
      </PageBleed>
    </Layout>
  )
}
