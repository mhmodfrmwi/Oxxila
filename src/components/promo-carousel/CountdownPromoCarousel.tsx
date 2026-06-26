import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useState, type ReactNode } from 'react'
import { carouselTransition } from '../carousel/carouselMotion'
import { useCarouselAutoplay } from '../../hooks/useCarouselAutoplay'
import { cn } from '../../lib/cn'
import { PromoCarouselCard, type PromoCarouselBackgroundVariant } from './PromoCarouselCard'

const SWIPE_THRESHOLD = 48
const AUTOPLAY_MS = 4000

export interface CountdownPromoSlide {
  id: string
  title: string
  targetDate: Date | string
  icon?: ReactNode
  backgroundVariant: PromoCarouselBackgroundVariant
}

/** @deprecated Use `CountdownPromoSlide` */
export type PromoCarouselSlide = CountdownPromoSlide

interface CountdownPromoCarouselProps {
  slides: readonly CountdownPromoSlide[]
  autoplayMs?: number
  className?: string
  ariaLabel?: string
}

export function CountdownPromoCarousel({
  slides,
  autoplayMs = AUTOPLAY_MS,
  className,
  ariaLabel = 'Promotional offers',
}: CountdownPromoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const total = slides.length
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
    enabled: total > 1,
    intervalMs: autoplayMs,
    onAdvance: goNext,
  })

  if (total === 0) return null

  const currentSlide = slides[activeSlide]

  return (
    <section
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      className={cn('relative', className)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={carouselTransition}
            drag={total > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.x < -SWIPE_THRESHOLD) goNext()
              else if (info.offset.x > SWIPE_THRESHOLD) goPrev()
            }}
          >
            <PromoCarouselCard
              title={currentSlide.title}
              targetDate={currentSlide.targetDate}
              icon={currentSlide.icon}
              backgroundVariant={currentSlide.backgroundVariant}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
