// src/pages/CartPage.tsx
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { CartPageContent } from '../components/cart/CartPageContent'

export function CartPage() {
  return (
    <Layout
      utilityPromo={{
        title: 'Return within 20 days',
        subtitle: 'from purchase date',
      }}
    >
      <PageBleed>
        <CartPageContent />
      </PageBleed>
    </Layout>
  )
}
