// src/components/category/filters/BrandFilter.tsx
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import type { ApiBrand } from '../../../types/catalog'
import { catalogDisplayName } from '../../../utils/catalogDisplayName'
import { resolveProductImageUrl } from '../../../utils/productImage'
import { focusRingClasses } from '../../ui/interactionStyles'
import { FilterSection } from './FilterSection'

interface BrandFilterProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  brands: ApiBrand[]
}

export function BrandFilter({ selectedIds, onChange, brands }: BrandFilterProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? i18n.language

  function toggleBrand(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  if (brands.length === 0) {
    return null
  }

  return (
    <FilterSection title={t('categoryFilters.sections.brand')}>
      <ul className="flex flex-wrap gap-2">
        {brands.map((brand) => {
          const isSelected = selectedIds.includes(brand._id)
          const label = catalogDisplayName(brand, locale, 'brand')

          return (
            <li key={brand._id} className="min-w-0 max-w-full">
              <button
                type="button"
                onClick={() => toggleBrand(brand._id)}
                data-selected={isSelected}
                className={cn('filter-brand-chip', focusRingClasses)}
                aria-pressed={isSelected}
              >
                <span className="filter-brand-logo">
                  {brand.logo ? (
                    <img
                      src={resolveProductImageUrl(brand.logo)}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      draggable={false}
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xs font-medium text-secondary-text">
                      {label.charAt(0)}
                    </span>
                  )}
                </span>
                <span className="filter-brand-name">{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </FilterSection>
  )
}
