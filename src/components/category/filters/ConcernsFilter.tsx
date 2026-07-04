import { FilterCheckboxList } from './FilterCheckboxList'
import { concernOptions, concernsCollapsedCount } from './filterOptionsData'
import { FilterSection } from './FilterSection'

interface ConcernsFilterProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function ConcernsFilter({ selectedIds, onChange }: ConcernsFilterProps) {
  return (
    <FilterSection title="Concerns">
      <FilterCheckboxList
        options={concernOptions}
        selectedIds={selectedIds}
        onChange={onChange}
        initialVisibleCount={concernsCollapsedCount}
      />
    </FilterSection>
  )
}
