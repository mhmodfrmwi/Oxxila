import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { carouselTransition } from '../../carousel/carouselMotion'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import { ProductCard } from './ProductCard'
import type { RecommendedProduct } from './recommendedProductsData'

const SWIPE_THRESHOLD = 48
/** Matches Tailwind `gap-5` — keep in sync with track `gap-5` class */
const TRACK_GAP_PX = 20

interface ProductCarouselProps {
  products: readonly RecommendedProduct[]
  ariaLabel?: string
  className?: string
}

function CarouselArrow({
  direction,
  onClick,
  disabled,
  className,
}: {
  direction: 'prev' | 'next'
  onClick: () => void
  disabled: boolean
  className?: string
}) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
  const label = direction === 'prev' ? 'Previous products' : 'Next products'

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-full sm:h-12 sm:w-12',
        'bg-button-primary/25 text-primary-text backdrop-blur-[2px]',
        'transition-[opacity,background-color,transform] duration-300 ease-out',
        '[@media(hover:hover)]:hover:bg-button-primary/40',
        focusRingClasses,
        'disabled:pointer-events-none disabled:opacity-0',
        'dark:bg-button-primary/30 dark:text-on-emphasis',
        'dark:[@media(hover:hover)]:hover:bg-button-primary/45',
        className,
      )}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </button>
  )
}

export function ProductCarousel({
  products,
  ariaLabel = 'Recommended products',
  className,
}: ProductCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [stepPx, setStepPx] = useState(0)
  const [maxIndex, setMaxIndex] = useState(0)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track?.firstElementChild) return

    const update = () => {
      const card = track.firstElementChild as HTMLElement
      const cardStep = card.offsetWidth + TRACK_GAP_PX
      const totalWidth = products.length * cardStep - TRACK_GAP_PX
      const maxScroll = Math.max(0, totalWidth - viewport.offsetWidth)
      const steps = cardStep > 0 ? Math.ceil(maxScroll / cardStep) : 0

      setStepPx(cardStep)
      setMaxIndex(steps)
      setActiveIndex((current) => Math.min(current, steps))
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(viewport)
    observer.observe(track.firstElementChild)

    return () => observer.disconnect()
  }, [products.length])

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(Math.max(0, Math.min(index, maxIndex)))
    },
    [maxIndex],
  )

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])

  if (products.length === 0) return null

  const canScroll = maxIndex > 0

  return (
    <div className={cn('relative', className)}>
      <div
        ref={viewportRef}
        className="overflow-hidden pr-2 sm:pr-4 lg:pr-14"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
      >
        <motion.div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-5"
          animate={{ x: -activeIndex * stepPx }}
          transition={carouselTransition}
          drag={canScroll ? 'x' : false}
          dragConstraints={{
            left: -maxIndex * stepPx,
            right: 0,
          }}
          dragElastic={0.08}
          onDragEnd={(_, info) => {
            if (info.offset.x < -SWIPE_THRESHOLD) goNext()
            else if (info.offset.x > SWIPE_THRESHOLD) goPrev()
          }}
        >
          {products.map((product) => (
            <div key={product.id} className="shrink-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </motion.div>
      </div>

      {canScroll && (
        <>
          <CarouselArrow
            direction="prev"
            onClick={goPrev}
            disabled={activeIndex === 0}
            className="absolute top-[calc(50%-2.5rem)] left-0 z-10 hidden -translate-y-1/2 lg:flex"
          />
          <CarouselArrow
            direction="next"
            onClick={goNext}
            disabled={activeIndex >= maxIndex}
            className="absolute top-[calc(50%-2.5rem)] right-0 z-10 -translate-y-1/2"
          />
        </>
      )}

      {canScroll && (
        <div className="mt-5 flex items-center justify-center gap-3 lg:hidden">
          <CarouselArrow direction="prev" onClick={goPrev} disabled={activeIndex === 0} />
          <CarouselArrow direction="next" onClick={goNext} disabled={activeIndex >= maxIndex} />
        </div>
      )}
    </div>
  )
}
