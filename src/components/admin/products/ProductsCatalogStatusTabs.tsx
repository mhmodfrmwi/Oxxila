// src/components/admin/products/ProductsCatalogStatusTabs.tsx
import { useTranslation } from 'react-i18next'
import type { AdminProductsCatalogTab } from '../../../types/adminProducts'
import { formatDashboardNumber } from '../../../utils/adminDashboardFormat'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'

const TABS: readonly AdminProductsCatalogTab[] = ['active', 'archived']

interface ProductsCatalogStatusTabsProps {
  active: AdminProductsCatalogTab
  activeCount: number
  onChange: (tab: AdminProductsCatalogTab) => void
  disabled?: boolean
}

export function ProductsCatalogStatusTabs({
  active,
  activeCount,
  onChange,
  disabled = false,
}: ProductsCatalogStatusTabsProps) {
  const { t, i18n } = useTranslation()

  return (
    <div
      className="flex gap-4 overflow-x-auto border-b border-white/10"
      role="tablist"
      aria-label={t('admin.products.statusFilterAria')}
    >
      {TABS.map((tab) => {
        const isSelected = tab === active
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isSelected}
            disabled={disabled}
            onClick={() => onChange(tab)}
            className={cn(
              'relative shrink-0 px-2 pb-[14px] text-sm transition-colors',
              focusRingClasses,
              isSelected
                ? 'border-b-2 border-accent pb-[13.2px] font-semibold text-accent'
                : 'font-medium text-white/40 hover:text-white/60',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            <span className="inline-flex items-end gap-2">
              <span>{t(`admin.products.tabs.${tab}`)}</span>
              {isSelected ? (
                <span className="rounded-full bg-accent/20 px-1.5 py-px text-[8px] font-semibold leading-[11.2px] text-accent">
                  {formatDashboardNumber(activeCount, i18n.language)}
                </span>
              ) : null}
            </span>
          </button>
        )
      })}
    </div>
  )
}
