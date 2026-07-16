// src/pages/ReturnsHistoryPage.tsx
import { useTranslation } from 'react-i18next'
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { ReturnsHistoryPageContent } from '../components/returns/ReturnsHistoryPageContent'

export function ReturnsHistoryPage() {
  const { t } = useTranslation()

  return (
    <Layout
      utilityPromo={{
        title: t('shop.promo.title'),
        subtitle: t('shop.promo.subtitle'),
      }}
    >
      <PageBleed>
        <ReturnsHistoryPageContent />
      </PageBleed>
    </Layout>
  )
}
