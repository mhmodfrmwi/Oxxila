import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import { brandStores } from '../../shop/brand-stores/brandStoresData'
import { FilterSection } from './FilterSection'

interface BrandFilterProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function BrandFilter({ selectedIds, onChange }: BrandFilterProps) {
  function toggleBrand(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  return (
    <FilterSection title="Brand">
      <ul className="grid grid-cols-2 gap-2">
        {brandStores.map((brand) => {
          const isSelected = selectedIds.includes(brand.id)

          return (
            <li key={brand.id} className="min-w-0">
              <button
                type="button"
                onClick={() => toggleBrand(brand.id)}
                data-selected={isSelected}
                className={cn('filter-brand-chip w-full', focusRingClasses)}
                aria-pressed={isSelected}
              >
                <span className="filter-brand-logo">
                  <img
                    src={brand.logo}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    draggable={false}
                  />
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
