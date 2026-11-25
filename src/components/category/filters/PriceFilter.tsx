// src/components/category/filters/PriceFilter.tsx
import { useTranslation } from 'react-i18next'
import { FilterSection } from './FilterSection'
import type { PriceSort } from './filterState'

interface PriceFilterProps {
  value: PriceSort
  onChange: (value: PriceSort) => void
}

export function PriceFilter({ value, onChange }: PriceFilterProps) {
  const { t } = useTranslation()
  const priceOptions: { value: PriceSort; labelKey: string }[] = [
    { value: 'all', labelKey: 'categoryFilters.priceAll' },
    { value: 'low-to-high', labelKey: 'categoryFilters.priceLowToHigh' },
    { value: 'high-to-low', labelKey: 'categoryFilters.priceHighToLow' },
  ]

  return (
    <FilterSection title={t('categoryFilters.sections.price')}>
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
              <span>{t(option.labelKey)}</span>
            </label>
          </li>
        ))}
      </ul>
    </FilterSection>
  )
}
