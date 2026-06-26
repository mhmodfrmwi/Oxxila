import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import { shopCategories } from '../../shop/shopData'
import { FilterSection } from './FilterSection'

interface CategoryFilterProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function CategoryFilter({ selectedIds, onChange }: CategoryFilterProps) {
  function toggleCategory(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  return (
    <FilterSection title="Category">
      <div className="flex flex-wrap gap-2">
        {shopCategories.map((category) => {
          const isSelected = selectedIds.includes(category.id)

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => toggleCategory(category.id)}
              data-selected={isSelected}
              className={cn('filter-chip px-2.5 py-1.5', focusRingClasses)}
              aria-pressed={isSelected}
            >
              {category.name}
            </button>
          )
        })}
      </div>
    </FilterSection>
  )
}
