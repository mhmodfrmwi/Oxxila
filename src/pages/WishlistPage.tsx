// src/pages/WishlistPage.tsx
import { useTranslation } from 'react-i18next'
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { WishlistPageContent } from '../components/wishlist/WishlistPageContent'

export function WishlistPage() {
  const { t } = useTranslation()

  return (
    <Layout
      utilityPromo={{
        title: t('shop.promo.title'),
        subtitle: t('shop.promo.subtitle'),
      }}
    >
      <PageBleed>
        <WishlistPageContent />
      </PageBleed>
    </Layout>
  )
}
