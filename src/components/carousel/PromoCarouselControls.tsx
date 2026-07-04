// src/components/carousel/PromoCarouselControls.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'

interface PromoCarouselControlsProps {
  count: number
  activeIndex: number
  onSelect: (index: number) => void
  onPrev: () => void
  onNext: () => void
}

export function PromoCarouselControls({
  count,
  activeIndex,
  onSelect,
  onPrev,
  onNext,
}: PromoCarouselControlsProps) {
  const { t } = useTranslation()

  const arrowClass = cn(
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
    'text-secondary-text transition-colors hover:bg-input hover:text-primary-text',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
  )

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        className={arrowClass}
        onClick={onPrev}
        aria-label={t('shop.carousel.previousSlide')}
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </button>

      <div
        className="flex items-center justify-center gap-1.5"
        role="tablist"
        aria-label={t('shop.carousel.pagination')}
      >
        {Array.from({ length: count }).map((_, index) => {
          const isActive = index === activeIndex
          return (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={t('shop.carousel.goToSlide', { number: index + 1 })}
              onClick={() => onSelect(index)}
              className="flex h-8 w-6 items-center justify-center"
            >
              <span
                className={cn(
                  'block h-1.5 rounded-full transition-all duration-500 ease-out',
                  isActive
                    ? 'w-7 bg-button-primary'
                    : 'w-1.5 bg-accent-muted/70 hover:bg-button-primary/60',
                )}
              />
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className={arrowClass}
        onClick={onNext}
        aria-label={t('shop.carousel.nextSlide')}
      >
        <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  )
}
