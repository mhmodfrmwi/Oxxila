import { useTranslation } from 'react-i18next'
import { PaymentCallbackPreviewContent } from '../components/checkout/PaymentCallbackPreviewContent'
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'

export function PaymentCallbackPreviewPage() {
  const { t } = useTranslation()

  return (
    <Layout
      utilityPromo={{
        title: t('shop.promo.title'),
        subtitle: t('shop.promo.subtitle'),
      }}
    >
      <PageBleed>
        <PaymentCallbackPreviewContent />
      </PageBleed>
    </Layout>
  )
}
