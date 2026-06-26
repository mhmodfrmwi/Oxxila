import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { CategoryPageContent } from '../components/category/CategoryPageContent'

export function CategoryPage() {
  return (
    <Layout
      utilityPromo={{
        title: 'Return within 30 days',
        subtitle: 'from purchase date',
      }}
    >
      <PageBleed>
        <CategoryPageContent />
      </PageBleed>
    </Layout>
  )
}
