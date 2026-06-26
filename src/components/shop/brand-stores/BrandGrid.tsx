import { BrandCard } from './BrandCard'
import type { BrandStore } from './brandStoresData'

interface BrandGridProps {
  brands: readonly BrandStore[]
}

export function BrandGrid({ brands }: BrandGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
      {brands.map((brand) => (
        <li key={brand.id}>
          <BrandCard brand={brand} />
        </li>
      ))}
    </ul>
  )
}
