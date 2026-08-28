// src/pages/CartPage.tsx
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { CartPageContent } from '../components/cart/CartPageContent'

export function CartPage() {
  return (
    <Layout>
      <PageBleed>
        <CartPageContent />
      </PageBleed>
    </Layout>
  )
}
