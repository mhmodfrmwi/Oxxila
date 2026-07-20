// src/components/carousel/StripCarousel.tsx
import { motion } from 'framer-motion'
import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { CarouselFrame } from './CarouselFrame'
import { carouselTransition } from './carouselMotion'
import { StripCarouselControls } from './StripCarouselControls'

const SWIPE_THRESHOLD = 48
/** Matches Tailwind `gap-4` — keep in sync with track `gap-4` class */
const TRACK_GAP_PX = 16

interface StripCarouselProps<T> {
  items: readonly T[]
  getItemKey: (item: T) => string
  renderItem: (item: T) => ReactNode
  ariaLabel?: string
  className?: string
  controlsTone?: 'default' | 'emphasis'
}

export function StripCarousel<T>({
  items,
  getItemKey,
  renderItem,
  ariaLabel = 'Carousel',
  className,
  controlsTone = 'default',
}: StripCarouselProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [stepPx, setStepPx] = useState(0)
  const [maxIndex, setMaxIndex] = useState(0)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const dragDistanceRef = useRef(0)

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track?.firstElementChild) return

    const update = () => {
      const card = track.firstElementChild as HTMLElement
      const cardStep = card.offsetWidth + TRACK_GAP_PX
      const totalWidth = items.length * cardStep - TRACK_GAP_PX
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
  }, [items.length])

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(Math.max(0, Math.min(index, maxIndex)))
    },
    [maxIndex],
  )

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])

  if (items.length === 0) return null

  const pageCount = maxIndex + 1

  return (
    <CarouselFrame as="section" aria-label={ariaLabel} className={className}>
      <div ref={viewportRef} className="overflow-hidden">
        <motion.div
          ref={trackRef}
          className="flex gap-4"
          animate={{ x: -activeIndex * stepPx }}
          transition={carouselTransition}
          drag="x"
          dragConstraints={{
            left: -maxIndex * stepPx,
            right: 0,
          }}
          dragElastic={0.08}
          onDragStart={() => {
            dragDistanceRef.current = 0
          }}
          onDrag={(_, info) => {
            dragDistanceRef.current = Math.abs(info.offset.x)
          }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -SWIPE_THRESHOLD) goNext()
            else if (info.offset.x > SWIPE_THRESHOLD) goPrev()
          }}
          onClickCapture={(event) => {
            // Prevent accidental link navigation after a swipe gesture.
            if (dragDistanceRef.current > 8) {
              event.preventDefault()
              event.stopPropagation()
            }
          }}
        >
          {items.map((item) => (
            <div key={getItemKey(item)} className="shrink-0">
              {renderItem(item)}
            </div>
          ))}
        </motion.div>
      </div>

      {pageCount > 1 && (
        <div className="mt-5 sm:mt-6">
          <StripCarouselControls
            count={pageCount}
            activeIndex={activeIndex}
            onSelect={goTo}
            onPrev={goPrev}
            onNext={goNext}
            tone={controlsTone}
          />
        </div>
      )}
    </CarouselFrame>
  )
}
