import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import type { ApiBrand } from '../../../types/catalog'
import { resolveProductImageUrl } from '../../../utils/productImage'
import { FilterSection } from './FilterSection'

interface BrandFilterProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  brands: ApiBrand[]
}

export function BrandFilter({ selectedIds, onChange, brands }: BrandFilterProps) {
  function toggleBrand(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  if (brands.length === 0) {
    return null
  }

  return (
    <FilterSection title="Brand">
      <ul className="grid grid-cols-2 gap-2">
        {brands.map((brand) => {
          const isSelected = selectedIds.includes(brand._id)

          return (
            <li key={brand._id} className="min-w-0">
              <button
                type="button"
                onClick={() => toggleBrand(brand._id)}
                data-selected={isSelected}
                className={cn('filter-brand-chip w-full', focusRingClasses)}
                aria-pressed={isSelected}
              >
                <span className="filter-brand-logo">
                  {brand.logo ? (
                    <img
                      src={resolveProductImageUrl(brand.logo)}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      draggable={false}
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xs font-medium text-secondary-text">
                      {brand.name.charAt(0)}
                    </span>
                  )}
                </span>
                <span className="filter-brand-name">{brand.name}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </FilterSection>
  )
}
