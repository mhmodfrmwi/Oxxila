// src/components/ui/RouteFallback.tsx
import { Layout } from '../layout/Layout'
import { BrandLoader } from './BrandLoader'

/**
 * Storefront route-chunk fallback: header + utility bar stay visible (same Layout the
 * page will mount), with the branded Oxxila loader in the content area.
 */
export function RouteFallback() {
  return (
    <Layout>
      <div className="container-content" aria-busy="true">
        <BrandLoader />
      </div>
    </Layout>
  )
}
