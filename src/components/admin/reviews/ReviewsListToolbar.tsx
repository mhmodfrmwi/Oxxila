// src/components/admin/reviews/ReviewsListToolbar.tsx
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'

interface ReviewsListToolbarProps {
  keyword: string
  onKeywordChange: (value: string) => void
  disabled?: boolean
}

export function ReviewsListToolbar({
  keyword,
  onKeywordChange,
  disabled = false,
}: ReviewsListToolbarProps) {
  const { t } = useTranslation()

  return (
    <label className="relative block w-full sm:w-[var(--admin-search-width)]">
      <span className="sr-only">{t('admin.reviews.searchLabel')}</span>
      <Search
        size={18}
        className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-white/45"
        aria-hidden
      />
      <input
        type="search"
        value={keyword}
        disabled={disabled}
        onChange={(event) => onKeywordChange(event.target.value)}
        placeholder={t('admin.reviews.searchPlaceholder')}
        className={cn(
          'h-[var(--admin-search-height)] w-full rounded-full border border-white/10 bg-white/5 pe-5 ps-12',
          'text-sm text-primary-text placeholder:text-white/50',
          'shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.05)]',
          'transition-colors hover:bg-white/[0.07]',
          focusRingClasses,
          disabled && 'cursor-not-allowed opacity-60',
        )}
        autoComplete="off"
      />
    </label>
  )
}
