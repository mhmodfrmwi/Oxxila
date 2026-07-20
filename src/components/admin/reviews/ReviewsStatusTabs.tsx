// src/components/admin/reviews/ReviewsStatusTabs.tsx
import { useTranslation } from 'react-i18next'
import type { AdminReviewsStatusTab } from '../../../types/adminReviews'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'

const TABS: readonly AdminReviewsStatusTab[] = [
  'all',
  'pending',
  'approved',
  'reported',
] as const

interface ReviewsStatusTabsProps {
  active: AdminReviewsStatusTab
  onChange: (tab: AdminReviewsStatusTab) => void
  disabled?: boolean
}

export function ReviewsStatusTabs({
  active,
  onChange,
  disabled = false,
}: ReviewsStatusTabsProps) {
  const { t } = useTranslation()

  return (
    <div
      className="flex flex-wrap gap-1 rounded-full border border-white/10 bg-white/5 p-1"
      role="tablist"
      aria-label={t('admin.reviews.statusFilterAria')}
    >
      {TABS.map((tab) => {
        const isActive = tab === active
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onChange(tab)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              focusRingClasses,
              isActive
                ? 'bg-accent font-semibold text-white'
                : 'text-white/40 hover:text-white/70',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            {t(`admin.reviews.tabs.${tab}`)}
          </button>
        )
      })}
    </div>
  )
}
