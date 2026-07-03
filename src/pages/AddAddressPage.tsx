// src/pages/AddAddressPage.tsx
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { AddAddressPageContent } from '../components/account/AddAddressPageContent'

export function AddAddressPage() {
  return (
    <Layout>
      <PageBleed>
        <AddAddressPageContent />
      </PageBleed>
    </Layout>
  )
}
