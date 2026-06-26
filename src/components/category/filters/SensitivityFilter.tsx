import { FilterCheckboxList } from './FilterCheckboxList'
import { sensitivityOptions } from './filterOptionsData'
import { FilterStandaloneSection } from './FilterStandaloneSection'

interface SensitivityFilterProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function SensitivityFilter({ selectedIds, onChange }: SensitivityFilterProps) {
  return (
    <FilterStandaloneSection title="Sensitivity">
      <FilterCheckboxList
        options={sensitivityOptions}
        selectedIds={selectedIds}
        onChange={onChange}
      />
    </FilterStandaloneSection>
  )
}
