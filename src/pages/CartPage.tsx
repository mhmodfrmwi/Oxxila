// src/pages/CartPage.tsx
import { useTranslation } from 'react-i18next'
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { CartPageContent } from '../components/cart/CartPageContent'

export function CartPage() {
  const { t } = useTranslation()

  return (
    <Layout
      utilityPromo={{
        title: t('shop.promo.title'),
        subtitle: t('shop.promo.subtitle'),
      }}
    >
      <PageBleed>
        <CartPageContent />
      </PageBleed>
    </Layout>
  )
}
