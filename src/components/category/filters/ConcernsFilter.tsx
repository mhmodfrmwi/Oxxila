import { FilterCheckboxList } from './FilterCheckboxList'
import { concernOptions, concernsCollapsedCount } from './filterOptionsData'
import { FilterStandaloneSection } from './FilterStandaloneSection'

interface ConcernsFilterProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function ConcernsFilter({ selectedIds, onChange }: ConcernsFilterProps) {
  return (
    <FilterStandaloneSection title="Concerns">
      <FilterCheckboxList
        options={concernOptions}
        selectedIds={selectedIds}
        onChange={onChange}
        initialVisibleCount={concernsCollapsedCount}
      />
    </FilterStandaloneSection>
  )
}
