// src/pages/OrderConfirmationPage.tsx
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { OrderConfirmationContent } from '../components/checkout/OrderConfirmationContent'

export function OrderConfirmationPage() {
  return (
    <Layout
      utilityPromo={{
        title: 'Return within 20 days',
        subtitle: 'from purchase date',
      }}
    >
      <PageBleed>
        <OrderConfirmationContent />
      </PageBleed>
    </Layout>
  )
}
