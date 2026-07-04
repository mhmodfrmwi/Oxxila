// src/pages/OrderConfirmationPage.tsx
import { useTranslation } from 'react-i18next'
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { OrderConfirmationContent } from '../components/checkout/OrderConfirmationContent'

export function OrderConfirmationPage() {
  const { t } = useTranslation()

  return (
    <Layout
      utilityPromo={{
        title: t('shop.promo.title'),
        subtitle: t('shop.promo.subtitle'),
      }}
    >
      <PageBleed>
        <OrderConfirmationContent />
      </PageBleed>
    </Layout>
  )
}
