import { FilterCheckboxList } from './FilterCheckboxList'
import { offerOptions } from './filterOptionsData'
import { FilterSection } from './FilterSection'

interface OffersFilterProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function OffersFilter({ selectedIds, onChange }: OffersFilterProps) {
  return (
    <FilterSection title="Offers">
      <FilterCheckboxList options={offerOptions} selectedIds={selectedIds} onChange={onChange} />
    </FilterSection>
  )
}
