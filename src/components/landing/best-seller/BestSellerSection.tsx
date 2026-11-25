// src/components/landing/best-seller/BestSellerSection.tsx
import { motion } from 'framer-motion'
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CarouselFrame } from '../../carousel/CarouselFrame'
import { getWrappedOffset } from '../../carousel/getWrappedOffset'
import { getCollectionHref } from '../../../config/collections'
import { useCarouselAutoplay } from '../../../hooks/useCarouselAutoplay'
import { useHorizontalWheel } from '../../../hooks/useHorizontalWheel'
import { useLandingCatalogContext } from '../../../hooks/useLandingCatalogContext'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import { cn } from '../../../lib/cn'
import { FadeUp } from '../../ui/FadeUp'
import { SectionHeader } from '../SectionHeader'
import { CarouselControls } from './CarouselControls'
import { getCoverflowLayout } from './coverflowLayout'
import { ProductCard } from './ProductCard'

const AUTOPLAY_MS = 2000
const SWIPE_THRESHOLD = 50
const MAX_SWIPE_STEPS = 3
/** Keeps the active card's hover lift and shadow inside the clipped frame. */
const FRAME_TOP_PADDING = 12
/** Figma "Frame 24" ends 18px below its 228px active card; dropped side cards overflow under the fade. */
const FRAME_BOTTOM_RATIO = 18 / 228

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(() =>
    typeof window === 'undefined' ? 1280 : Math.min(window.innerWidth - 32, 1308),
  )

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const update = () => setWidth(element.clientWidth)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, width] as const
}

function useViewportHeight() {
  const [height, setHeight] = useState(() =>
    typeof window === 'undefined' ? 900 : window.innerHeight,
  )

  useLayoutEffect(() => {
    const update = () => setHeight(window.innerHeight)
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return height
}

export function BestSellerSection() {
  const { t } = useTranslation()
  const { bestSellers, loading, error } = useLandingCatalogContext()
  const [activeIndex, setActiveIndex] = useState(0)
  /** +1 when the fan moved forward, -1 backward; lets wrapping cards skip the reverse fly-across. */
  const [direction, setDirection] = useState(0)
  const [frameRef, frameWidth] = useElementWidth<HTMLDivElement>()
  const viewportHeight = useViewportHeight()
  const layout = useMemo(
    () => getCoverflowLayout(frameWidth, viewportHeight),
    [frameWidth, viewportHeight],
  )
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const dragDistanceRef = useRef(0)
  const total = bestSellers.length
  const activeSlide = total === 0 ? 0 : Math.min(activeIndex, total - 1)

  const goTo = useCallback(
    (index: number, moveDirection?: number) => {
      if (total === 0) return
      const next = ((index % total) + total) % total
      setDirection(moveDirection ?? Math.sign(getWrappedOffset(next, activeSlide, total)))
      setActiveIndex(next)
    },
    [total, activeSlide],
  )

  const goNext = useCallback(() => goTo(activeSlide + 1, 1), [activeSlide, goTo])
  const goPrev = useCallback(() => goTo(activeSlide - 1, -1), [activeSlide, goTo])

  const { onMouseEnter, onMouseLeave } = useCarouselAutoplay({
    enabled: total > 0 && !prefersReducedMotion,
    intervalMs: AUTOPLAY_MS,
    onAdvance: goNext,
  })
  const onWheel = useHorizontalWheel({ onNext: goNext, onPrev: goPrev })

  return (
    <section
      aria-labelledby="best-sellers-heading"
      className="landing-band mt-6 py-10 lg:mt-[50px]"
    >
      <div className="container-content flex flex-col items-center gap-6">
        <FadeUp className="w-full">
          <SectionHeader
            id="best-sellers-heading"
            title={t('home.bestSellers.title')}
            subtitle={t('home.bestSellers.subtitle')}
            align="center"
          />
        </FadeUp>

        <FadeUp
          ref={frameRef}
          className="relative w-full"
          delay={0.1}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {loading ? (
            <div className="flex justify-center pt-3">
              <div
                className="aspect-[228/340] animate-pulse rounded-small bg-background"
                style={{ width: layout.cardWidth }}
              />
            </div>
          ) : error ? (
            <p className="py-12 text-center text-sm text-support-error" role="alert">
              {error}
            </p>
          ) : total === 0 ? (
            <p className="py-12 text-center text-sm text-secondary-text" role="status">
              {t('home.bestSellers.empty')}
            </p>
          ) : (
            <CarouselFrame
              className="overflow-x-clip"
              style={{
                paddingTop: FRAME_TOP_PADDING,
                paddingBottom: layout.cardWidth * FRAME_BOTTOM_RATIO,
              }}
            >
              <motion.div
                className="grid cursor-grab touch-pan-y active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.35}
                onWheel={onWheel}
                onDragStart={() => {
                  dragDistanceRef.current = 0
                  onMouseEnter()
                }}
                onDrag={(_, info) => {
                  dragDistanceRef.current = Math.abs(info.offset.x)
                }}
                onDragEnd={(event, info) => {
                  // A mouse is still hovering the frame, which keeps autoplay paused on its own.
                  if (!('pointerType' in event && event.pointerType === 'mouse')) onMouseLeave()
                  const swipe = info.offset.x + info.velocity.x * 0.15
                  if (Math.abs(swipe) < SWIPE_THRESHOLD) return
                  const steps = Math.min(
                    MAX_SWIPE_STEPS,
                    Math.max(1, Math.round(Math.abs(swipe) / layout.cardWidth)),
                  )
                  goTo(activeSlide + (swipe < 0 ? steps : -steps), swipe < 0 ? 1 : -1)
                }}
                onClickCapture={(event) => {
                  // A swipe must not also open the product or select a side card.
                  if (dragDistanceRef.current > 8) {
                    event.preventDefault()
                    event.stopPropagation()
                  }
                }}
              >
                {bestSellers.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    offset={getWrappedOffset(index, activeSlide, total)}
                    isActive={index === activeSlide}
                    direction={direction}
                    layout={layout}
                    onSelect={() => goTo(index)}
                  />
                ))}
              </motion.div>
              <div
                className="best-seller-fade pointer-events-none absolute inset-x-0 top-0 z-40"
                style={{ bottom: -layout.dropAllowance }}
                aria-hidden
              />
            </CarouselFrame>
          )}
        </FadeUp>

        {!loading && !error && total > 0 && (
          <CarouselControls
            count={total}
            activeIndex={activeSlide}
            onSelect={goTo}
            className="relative z-50"
          />
        )}

        <Link
          to={getCollectionHref('best-sellers')}
          className={cn(
            'landing-type landing-text-small relative z-50 inline-flex h-[60px] w-[280px] max-w-full items-center justify-center rounded-[40px] px-9 sm:h-[70px]',
            'bg-button-primary text-on-emphasis',
            'transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-button-primary/40',
            'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card',
          )}
        >
          {t('home.bestSellers.viewAll')}
        </Link>
      </div>
    </section>
  )
}
