import { FilterCheckboxList } from './FilterCheckboxList'
import { sensitivityOptions } from './filterOptionsData'
import { FilterSection } from './FilterSection'

interface SensitivityFilterProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function SensitivityFilter({ selectedIds, onChange }: SensitivityFilterProps) {
  return (
    <FilterSection title="Sensitivity">
      <FilterCheckboxList
        options={sensitivityOptions}
        selectedIds={selectedIds}
        onChange={onChange}
      />
    </FilterSection>
  )
}
