import { FilterSection } from './FilterSection'
import type { PriceSort } from './filterState'

const priceOptions: { value: PriceSort; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'low-to-high', label: 'Low to high' },
  { value: 'high-to-low', label: 'High to low' },
]

interface PriceFilterProps {
  value: PriceSort
  onChange: (value: PriceSort) => void
}

export function PriceFilter({ value, onChange }: PriceFilterProps) {
  return (
    <FilterSection title="Price">
      <ul className="filter-checkbox-list-items">
        {priceOptions.map((option) => (
          <li key={option.value}>
            <label className="filter-option-row">
              <input
                type="radio"
                name="price-sort"
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className="filter-radio"
              />
              <span>{option.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </FilterSection>
  )
}
