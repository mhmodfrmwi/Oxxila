import { useTranslation } from 'react-i18next'
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { PaymentCallbackContent } from '../components/checkout/PaymentCallbackContent'

export function PaymentCallbackPage() {
  const { t } = useTranslation()

  return (
    <Layout
      utilityPromo={{
        title: t('shop.promo.title'),
        subtitle: t('shop.promo.subtitle'),
      }}
    >
      <PageBleed>
        <PaymentCallbackContent />
      </PageBleed>
    </Layout>
  )
}
