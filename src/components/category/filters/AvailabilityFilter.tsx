import { FilterStandaloneSection } from './FilterStandaloneSection'

interface AvailabilityFilterProps {
  inStockOnly: boolean
  onChange: (inStockOnly: boolean) => void
}

export function AvailabilityFilter({ inStockOnly, onChange }: AvailabilityFilterProps) {
  return (
    <FilterStandaloneSection title="Availability">
      <label className="filter-option-row">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(event) => onChange(event.target.checked)}
          className="filter-checkbox"
        />
        <span>Available only</span>
      </label>
    </FilterStandaloneSection>
  )
}
