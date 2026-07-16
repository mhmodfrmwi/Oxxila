// src/pages/ReturnsPage.tsx
import { useTranslation } from 'react-i18next'
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { ReturnsPageContent } from '../components/returns/ReturnsPageContent'

export function ReturnsPage() {
  const { t } = useTranslation()

  return (
    <Layout
      utilityPromo={{
        title: t('shop.promo.title'),
        subtitle: t('shop.promo.subtitle'),
      }}
    >
      <PageBleed>
        <ReturnsPageContent />
      </PageBleed>
    </Layout>
  )
}
