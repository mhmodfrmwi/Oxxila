import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import type { ApiSubCategory } from '../../../types/catalog'
import { FilterSection } from './FilterSection'

interface CategoryFilterProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  subcategories: ApiSubCategory[]
}

export function CategoryFilter({ selectedIds, onChange, subcategories }: CategoryFilterProps) {
  function toggleCategory(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  if (subcategories.length === 0) {
    return null
  }

  return (
    <FilterSection title="Subcategory">
      <div className="flex flex-wrap gap-2">
        {subcategories.map((subcategory) => {
          const isSelected = selectedIds.includes(subcategory._id)

          return (
            <button
              key={subcategory._id}
              type="button"
              onClick={() => toggleCategory(subcategory._id)}
              data-selected={isSelected}
              className={cn('filter-chip px-2.5 py-1.5', focusRingClasses)}
              aria-pressed={isSelected}
            >
              {subcategory.name}
            </button>
          )
        })}
      </div>
    </FilterSection>
  )
}
