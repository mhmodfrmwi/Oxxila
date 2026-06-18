import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLandingCatalogContext } from '../../../hooks/useLandingCatalogContext'
import { CarouselControls } from './CarouselControls'
import { ProductCard } from './ProductCard'

const AUTOPLAY_MS = 4000
const SWIPE_THRESHOLD = 50

function useIsMobile(breakpoint = 769) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches : false,
  )

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const onChange = () => setIsMobile(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [breakpoint])

  return isMobile
}

function getWrappedOffset(index: number, activeIndex: number, total: number) {
  let diff = index - activeIndex
  if (diff > total / 2) diff -= total
  if (diff < -total / 2) diff += total
  return diff
}

export function BestSellerSection() {
  const { bestSellers, loading } = useLandingCatalogContext()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const isMobile = useIsMobile()
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

  useEffect(() => {
    if (isPaused || total === 0) return
    const timer = window.setInterval(goNext, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [goNext, isPaused, total])

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-page-light via-[#F0EEFF] to-page-light py-10 sm:py-14 lg:py-20 dark:bg-page-dark dark:from-page-dark dark:via-page-dark dark:to-page-dark">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(123,101,251,0.12)_0%,transparent_55%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(123,101,251,0.22)_0%,transparent_60%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1340px] px-4 sm:px-5 lg:px-6">
        <header className="text-center">
          <h2 className="font-serif text-3xl font-medium text-[#2D2A4A] md:text-4xl lg:text-5xl dark:text-white">
            Oxxila best seller
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#8B83C7] md:text-base lg:text-lg dark:text-[#AEA7FF]">
            Our most loved products, trusted by thousands
          </p>
        </header>

        <div
          className="relative mt-8 sm:mt-10 lg:mt-12"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[min(360px,65vw)] w-[min(360px,65vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-oxxila-accent/15 blur-[80px] sm:h-[min(420px,70vw)] sm:w-[min(420px,70vw)] dark:bg-[#7B65FB]/25 dark:blur-[100px]"
            aria-hidden
          />

          {loading ? (
            <div className="relative mx-auto flex h-[400px] max-w-4xl items-center justify-center sm:h-[430px] min-[769px]:h-[460px]">
              <div className="h-[360px] w-[min(260px,85vw)] animate-pulse rounded-[24px] bg-white/70 dark:bg-white/10" />
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
            className={[
              'inline-flex min-h-11 w-full max-w-sm items-center justify-center rounded-full px-8 py-3.5 sm:w-auto sm:min-w-[280px] sm:px-10 sm:py-4',
              'bg-gradient-to-r from-oxxila-accent to-oxxila-purple-light text-base font-semibold text-white',
              'shadow-lg shadow-oxxila-accent/25 transition-all duration-300 ease-out',
              'hover:-translate-y-1 hover:shadow-xl hover:shadow-oxxila-accent/40',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxxila-accent focus-visible:ring-offset-2',
              'dark:from-[#9886FF] dark:to-[#7B65FB] dark:shadow-[#7B65FB]/30',
              'dark:hover:shadow-[#9886FF]/50',
            ].join(' ')}
          >
            View all products
          </Link>
        </div>
      </div>
    </section>
  )
}
