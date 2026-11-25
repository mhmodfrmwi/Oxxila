// src/components/landing/best-seller/CarouselControls.tsx
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'

interface CarouselControlsProps {
  count: number
  activeIndex: number
  onSelect: (index: number) => void
  className?: string
}

export function CarouselControls({ count, activeIndex, onSelect, className }: CarouselControlsProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn('flex items-center justify-center p-[5px]', className)}
      role="tablist"
      aria-label={t('home.bestSellers.carouselAria')}
    >
      {Array.from({ length: count }).map((_, index) => {
        const isActive = index === activeIndex
        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={t('home.bestSellers.goToProduct', { number: index + 1 })}
            onClick={() => onSelect(index)}
            className="group flex h-6 items-center justify-center rounded-full px-[5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button-primary"
          >
            <span
              className={cn(
                'block h-[15px] rounded-extra-large transition-[width,background-color] duration-300 ease-out motion-reduce:transition-none',
                isActive
                  ? 'w-[42px] bg-button-primary'
                  : 'w-[15px] bg-button-secondary group-hover:bg-button-primary/60',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
