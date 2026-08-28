// src/pages/WishlistPage.tsx
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { WishlistPageContent } from '../components/wishlist/WishlistPageContent'

export function WishlistPage() {
  return (
    <Layout>
      <PageBleed>
        <WishlistPageContent />
      </PageBleed>
    </Layout>
  )
}
