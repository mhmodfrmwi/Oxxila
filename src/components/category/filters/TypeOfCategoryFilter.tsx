import { FilterCheckboxList } from './FilterCheckboxList'
import { typeOfCategoryOptions } from './filterOptionsData'
import { FilterSection } from './FilterSection'

interface TypeOfCategoryFilterProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function TypeOfCategoryFilter({ selectedIds, onChange }: TypeOfCategoryFilterProps) {
  return (
    <FilterSection title="Type of category">
      <FilterCheckboxList
        options={typeOfCategoryOptions}
        selectedIds={selectedIds}
        onChange={onChange}
      />
    </FilterSection>
  )
}
