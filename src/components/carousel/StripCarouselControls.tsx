import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/cn'

interface StripCarouselControlsProps {
  count: number
  activeIndex: number
  onSelect: (index: number) => void
  onPrev: () => void
  onNext: () => void
  tone?: 'default' | 'emphasis'
}

export function StripCarouselControls({
  count,
  activeIndex,
  onSelect,
  onPrev,
  onNext,
  tone = 'default',
}: StripCarouselControlsProps) {
  const onEmphasis = tone === 'emphasis'

  const arrowClass = cn(
    'flex min-h-9 min-w-9 items-center justify-center rounded-full transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button-primary',
    onEmphasis
      ? 'text-on-emphasis/70 hover:bg-white/10 hover:text-on-emphasis'
      : 'text-secondary-text hover:bg-input hover:text-primary-text focus-visible:ring-accent',
  )

  const inactiveDotClass = onEmphasis
    ? 'bg-on-emphasis/25 hover:bg-button-primary/70'
    : 'bg-accent-muted/60 hover:bg-button-primary/60 dark:bg-on-emphasis/20'

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
      <button type="button" className={arrowClass} onClick={onPrev} aria-label="Previous">
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>

      <div className="flex items-center justify-center gap-0.5" role="tablist" aria-label="Carousel pagination">
        {Array.from({ length: count }).map((_, index) => {
          const isActive = index === activeIndex
          return (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to page ${index + 1}`}
              onClick={() => onSelect(index)}
              className="flex min-h-9 min-w-7 items-center justify-center rounded-full"
            >
              <span
                className={cn(
                  'block h-1.5 rounded-full transition-all duration-500 ease-out',
                  isActive ? 'w-6 bg-button-primary' : cn('w-1.5', inactiveDotClass),
                )}
              />
            </button>
          )
        })}
      </div>

      <button type="button" className={arrowClass} onClick={onNext} aria-label="Next">
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}
