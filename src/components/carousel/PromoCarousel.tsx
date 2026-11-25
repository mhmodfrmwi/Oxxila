// src/components/carousel/PromoCarousel.tsx
import { motion } from 'framer-motion'
import { useCallback, useState, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { useCarouselAutoplay } from '../../hooks/useCarouselAutoplay'
import { CarouselFrame } from './CarouselFrame'
import { PromoCarouselControls } from './PromoCarouselControls'
import { carouselTransition, getLayeredCardMotion } from './carouselMotion'
import { getWrappedOffset } from './getWrappedOffset'
import { useCarouselViewport } from './useCarouselViewport'

const SWIPE_THRESHOLD = 50

export interface PromoCarouselSlideProps {
  offset: number
  isActive: boolean
  onSelect: () => void
  viewport: ReturnType<typeof useCarouselViewport>
}

interface PromoCarouselProps<T> {
  items: readonly T[]
  getItemKey: (item: T) => string
  renderSlide: (item: T, slideProps: PromoCarouselSlideProps) => ReactNode
  autoplayMs?: number
  className?: string
  trackClassName?: string
  /** Desktop card height — cards scale on smaller viewports */
  trackHeightClassName?: string
  ariaLabel?: string
}

export function PromoCarousel<T>({
  items,
  getItemKey,
  renderSlide,
  autoplayMs = 5000,
  className,
  trackClassName,
  trackHeightClassName =
    'h-[min(360px,78vw)] min-[640px]:h-[min(400px,68vw)] min-[769px]:h-[396px] min-[1536px]:h-[430px]',
  ariaLabel = 'Promotional carousel',
}: PromoCarouselProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0)
  const viewport = useCarouselViewport()
  const isSwipeable = viewport !== 'desktop'
  const total = items.length
  const activeSlide = total === 0 ? 0 : ((activeIndex % total) + total) % total

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return
      setActiveIndex(((index % total) + total) % total)
    },
    [total],
  )

  const goNext = useCallback(() => goTo(activeSlide + 1), [activeSlide, goTo])
  const goPrev = useCallback(() => goTo(activeSlide - 1), [activeSlide, goTo])

  const { onMouseEnter, onMouseLeave } = useCarouselAutoplay({
    enabled: total > 0,
    intervalMs: autoplayMs,
    onAdvance: goNext,
  })

  if (total === 0) return null

  return (
    <CarouselFrame
      as="section"
      aria-label={ariaLabel}
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={cn(
          'relative',
          viewport === 'desktop' && 'overflow-visible',
          viewport === 'mobile' && 'overflow-hidden px-1',
          viewport === 'tablet' && 'overflow-hidden',
        )}
      >
        <motion.div
          className={cn(
            'relative mx-auto w-full',
            viewport === 'desktop' ? 'max-w-[1280px]' : 'max-w-full',
            trackHeightClassName,
            trackClassName,
          )}
          drag={isSwipeable ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => {
            if (info.offset.x < -SWIPE_THRESHOLD) goNext()
            else if (info.offset.x > SWIPE_THRESHOLD) goPrev()
          }}
        >
          {items.map((item, index) => {
            const offset = getWrappedOffset(index, activeSlide, total)
            const cardMotion = getLayeredCardMotion(offset, viewport)
            const isActive = index === activeSlide
            const isVisible =
              viewport === 'desktop'
                ? Math.abs(offset) <= 2
                : viewport === 'tablet'
                  ? Math.abs(offset) <= 1
                  : offset === 0

            return (
              <motion.div
                key={getItemKey(item)}
                animate={{
                  x: cardMotion.x,
                  scale: cardMotion.scale,
                  opacity: cardMotion.opacity,
                }}
                transition={carouselTransition}
                className={cn(
                  'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                  !isVisible && 'pointer-events-none',
                )}
                style={{ zIndex: cardMotion.zIndex }}
                onClick={() => goTo(index)}
                aria-hidden={!isActive}
              >
                {renderSlide(item, {
                  offset,
                  isActive,
                  onSelect: () => goTo(index),
                  viewport,
                })}
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      <div className="relative mt-3 sm:mt-4">
        <PromoCarouselControls
          count={total}
          activeIndex={activeSlide}
          onSelect={goTo}
          onPrev={goPrev}
          onNext={goNext}
        />
      </div>
    </CarouselFrame>
  )
}
