import { BrandGrid } from './BrandGrid'
import { brandStores } from './brandStoresData'
import { ContentSection } from '../../layout/ContentSection'
import { SectionHeader } from '../../landing/SectionHeader'

export function BrandStores() {
  return (
    <ContentSection aria-labelledby="brand-stores-heading">
      <SectionHeader id="brand-stores-heading" title="Official brand stores" size="compact" />
      <BrandGrid brands={brandStores} />
    </ContentSection>
  )
}
