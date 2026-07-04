// src/components/category/filters/TypeOfCategoryFilter.tsx
import type { ApiSubCategory } from '../../../types/catalog'
import { FilterCheckboxList } from './FilterCheckboxList'
import { FilterStandaloneSection } from './FilterStandaloneSection'

interface TypeOfCategoryFilterProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  subcategories: ApiSubCategory[]
}

export function TypeOfCategoryFilter({
  selectedIds,
  onChange,
  subcategories,
}: TypeOfCategoryFilterProps) {
  if (subcategories.length === 0) return null

  const options = subcategories.map((subcategory) => ({
    id: subcategory._id,
    label: subcategory.name,
  }))

  return (
    <FilterStandaloneSection title="Type of Category">
      <FilterCheckboxList options={options} selectedIds={selectedIds} onChange={onChange} />
    </FilterStandaloneSection>
  )
}
