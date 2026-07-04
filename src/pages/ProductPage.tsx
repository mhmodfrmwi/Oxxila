// src/pages/ProductPage.tsx
import { useTranslation } from 'react-i18next'
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { ProductPageContent } from '../components/product/ProductPageContent'
import { Footer } from '../components/landing/footer/Footer'

export function ProductPage() {
  const { t } = useTranslation()

  return (
    <Layout
      utilityPromo={{
        title: t('productDetail.promo.title'),
        subtitle: t('productDetail.promo.subtitle'),
      }}
    >
      <PageBleed>
        <ProductPageContent />
        <Footer />
      </PageBleed>
    </Layout>
  )
}
