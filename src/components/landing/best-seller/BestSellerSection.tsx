import { motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { getWrappedOffset } from '../../carousel/getWrappedOffset'
import { useCarouselAutoplay } from '../../../hooks/useCarouselAutoplay'
import { gradientCtaClasses } from '../../ui/buttonStyles'
import { typeSmallClasses } from '../../ui/typography'
import { useLandingCatalogContext } from '../../../hooks/useLandingCatalogContext'
import { useMaxWidth } from '../../../hooks/useMediaQuery'
import { cn } from '../../../lib/cn'
import { SectionHeader } from '../SectionHeader'
import { CarouselControls } from './CarouselControls'
import { ProductCard } from './ProductCard'

const AUTOPLAY_MS = 4000
const SWIPE_THRESHOLD = 50
const MOBILE_BREAKPOINT = 769

export function BestSellerSection() {
  const { bestSellers, loading } = useLandingCatalogContext()
  const [activeIndex, setActiveIndex] = useState(0)
  const isMobile = useMaxWidth(MOBILE_BREAKPOINT)
  const total = bestSellers.length
  const activeSlide = total === 0 ? 0 : Math.min(activeIndex, total - 1)

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
    intervalMs: AUTOPLAY_MS,
    onAdvance: goNext,
  })

  return (
    <section className="relative overflow-hidden bg-background py-10 sm:py-14 lg:py-20">
      <div className="relative container-content">
        <SectionHeader
          title="Oxxila best seller"
          subtitle="Our most loved products, trusted by thousands"
          align="center"
        />

        <div
          className="relative mt-8 sm:mt-10 lg:mt-12"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[min(360px,65vw)] w-[min(360px,65vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-[80px] sm:h-[min(420px,70vw)] sm:w-[min(420px,70vw)]"
            aria-hidden
          />

          {loading ? (
            <div className="relative mx-auto flex h-[400px] max-w-4xl items-center justify-center sm:h-[430px] min-[769px]:h-[460px]">
              <div className="h-[360px] w-[min(260px,85vw)] animate-pulse rounded-[24px] bg-surface-muted/70 dark:bg-surface-subtle/40" />
            </div>
          ) : (
            <motion.div
              className="relative mx-auto h-[400px] max-w-4xl [perspective:1200px] sm:h-[430px] min-[769px]:h-[460px]"
              drag={isMobile ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={(_, info) => {
                if (info.offset.x < -SWIPE_THRESHOLD) goNext()
                else if (info.offset.x > SWIPE_THRESHOLD) goPrev()
              }}
            >
              <div className="absolute inset-0 backdrop-blur-[2px]" aria-hidden />

              {bestSellers.map((product, index) => {
                const offset = getWrappedOffset(index, activeSlide, total)
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    offset={offset}
                    isActive={index === activeSlide}
                    isMobile={isMobile}
                    onSelect={() => goTo(index)}
                  />
                )
              })}
            </motion.div>
          )}

          {!loading && total > 0 && (
            <div className="relative z-10 mt-8">
              <CarouselControls count={total} activeIndex={activeSlide} onSelect={goTo} />
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center sm:mt-10 lg:mt-12">
          <Link
            to="/shop?filter=best"
            className={cn(
              'inline-flex min-h-11 w-full max-w-sm items-center justify-center rounded-full px-8 py-3.5 sm:w-auto sm:min-w-[280px] sm:px-10 sm:py-4',
              gradientCtaClasses,
              typeSmallClasses,
              'text-on-emphasis transition-all duration-300 ease-out',
              'hover:-translate-y-1 hover:shadow-xl hover:shadow-button-primary/40',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button-primary focus-visible:ring-offset-2',
            )}
          >
            View all products
          </Link>
        </div>
      </div>
    </section>
  )
}
