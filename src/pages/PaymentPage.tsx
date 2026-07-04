// src/pages/PaymentPage.tsx
import { useTranslation } from 'react-i18next'
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { PaymentPageContent } from '../components/checkout/PaymentPageContent'

export function PaymentPage() {
  const { t } = useTranslation()

  return (
    <Layout
      utilityPromo={{
        title: t('shop.promo.title'),
        subtitle: t('shop.promo.subtitle'),
      }}
    >
      <PageBleed>
        <PaymentPageContent />
      </PageBleed>
    </Layout>
  )
}
