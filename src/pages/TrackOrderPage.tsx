// src/pages/TrackOrderPage.tsx
import { useTranslation } from 'react-i18next'
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { TrackOrderPageContent } from '../components/checkout/TrackOrderPageContent'

export function TrackOrderPage() {
  const { t } = useTranslation()

  return (
    <Layout
      utilityPromo={{
        title: t('shop.promo.title'),
        subtitle: t('shop.promo.subtitle'),
      }}
    >
      <PageBleed>
        <TrackOrderPageContent />
      </PageBleed>
    </Layout>
  )
}
