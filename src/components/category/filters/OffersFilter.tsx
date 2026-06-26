import { FilterCheckboxList } from './FilterCheckboxList'
import { offerOptions } from './filterOptionsData'
import { FilterStandaloneSection } from './FilterStandaloneSection'

interface OffersFilterProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function OffersFilter({ selectedIds, onChange }: OffersFilterProps) {
  return (
    <FilterStandaloneSection title="Offers">
      <FilterCheckboxList options={offerOptions} selectedIds={selectedIds} onChange={onChange} />
    </FilterStandaloneSection>
  )
}
