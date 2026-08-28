// src/pages/ReturnsPage.tsx
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { ReturnsPageContent } from '../components/returns/ReturnsPageContent'

export function ReturnsPage() {
  return (
    <Layout>
      <PageBleed>
        <ReturnsPageContent />
      </PageBleed>
    </Layout>
  )
}
