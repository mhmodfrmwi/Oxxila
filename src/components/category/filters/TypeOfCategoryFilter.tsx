// src/components/category/filters/TypeOfCategoryFilter.tsx
import type { ApiSubCategory } from '../../../types/catalog'
import { FilterCheckboxList } from './FilterCheckboxList'
import { FilterSection } from './FilterSection'

interface TypeOfCategoryFilterProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  subcategories: ApiSubCategory[]
  loading?: boolean
}

export function TypeOfCategoryFilter({
  selectedIds,
  onChange,
  subcategories,
  loading = false,
}: TypeOfCategoryFilterProps) {
  const options = subcategories.map((subcategory) => ({
    id: subcategory._id,
    label: subcategory.name,
  }))

  return (
    <FilterSection title="Type of Category">
      {loading ? (
        <p className="text-sm text-secondary-text" role="status">
          Loading types…
        </p>
      ) : options.length === 0 ? (
        <p className="text-sm text-secondary-text" role="status">
          No types available.
        </p>
      ) : (
        <FilterCheckboxList options={options} selectedIds={selectedIds} onChange={onChange} />
      )}
    </FilterSection>
  )
}
