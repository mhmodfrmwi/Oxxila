// src/components/shop/recommended/ProductCarousel.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import { ProductCard } from './ProductCard'
import type { RecommendedProduct } from './recommendedProductsData'

interface ProductCarouselProps {
  products: readonly RecommendedProduct[]
  ariaLabel?: string
  className?: string
  /** Show the small "why recommended" chip on each card. */
  showReason?: boolean
}

const arrowClasses = cn(
  'absolute top-[38%] z-30 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full',
  'border border-border-subtle bg-card text-foreground shadow-[var(--catalog-card-shadow)]',
  'transition-[opacity,transform] duration-200 hover:scale-105',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button-primary',
  'disabled:pointer-events-none disabled:opacity-0 md:flex',
  'dark:border-white/20 dark:shadow-[var(--catalog-card-shadow-dark)]',
)

/**
 * Horizontal product rail built on native scroll-snap.
 *
 * Native overflow scrolling follows the document direction, so in Arabic the
 * rail starts on the right and swipes/arrows move the correct way — no
 * physical-X transform math (the old framer track was forced LTR and broke RTL).
 */
export function ProductCarousel({ products, ariaLabel, className, showReason }: ProductCarouselProps) {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.dir() === 'rtl'
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const resolvedAriaLabel = ariaLabel ?? t('shop.recommended.ariaLabel')

  const updateEdges = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    // scrollLeft is 0 at the start edge and negative toward the end in RTL.
    const progress = Math.abs(track.scrollLeft)
    const max = track.scrollWidth - track.clientWidth
    setCanPrev(progress > 4)
    setCanNext(max - progress > 4)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    updateEdges()
    const observer = new ResizeObserver(updateEdges)
    observer.observe(track)
    track.addEventListener('scroll', updateEdges, { passive: true })
    return () => {
      observer.disconnect()
      track.removeEventListener('scroll', updateEdges)
    }
  }, [updateEdges, products.length, isRtl])

  const scrollByPage = useCallback(
    (direction: 1 | -1) => {
      const track = trackRef.current
      if (!track) return
      const card = track.firstElementChild as HTMLElement | null
      const step = card ? card.offsetWidth + 16 : track.clientWidth * 0.8
      const visibleCards = Math.max(1, Math.floor(track.clientWidth / step))
      const distance = step * visibleCards * direction
      track.scrollBy({ left: isRtl ? -distance : distance, behavior: 'smooth' })
    },
    [isRtl],
  )

  if (products.length === 0) return null

  // Physical arrow placement: "previous" sits at the start edge of the reading direction.
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft
  const NextIcon = isRtl ? ChevronLeft : ChevronRight

  return (
    <div className={cn('relative', className)}>
      <div
        ref={trackRef}
        className={cn(
          'flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth pb-3 sm:gap-4',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
        role="region"
        aria-roledescription="carousel"
        aria-label={resolvedAriaLabel}
      >
        {products.map((product) => (
          <div key={product.id} className="shrink-0 snap-start">
            <ProductCard product={product} showReason={showReason} />
          </div>
        ))}
      </div>

      <button
        type="button"
        className={cn(arrowClasses, '-start-4')}
        onClick={() => scrollByPage(-1)}
        disabled={!canPrev}
        aria-label={t('common.previous', { defaultValue: 'Previous' })}
      >
        <PrevIcon size={20} aria-hidden />
      </button>
      <button
        type="button"
        className={cn(arrowClasses, '-end-4')}
        onClick={() => scrollByPage(1)}
        disabled={!canNext}
        aria-label={t('common.next', { defaultValue: 'Next' })}
      >
        <NextIcon size={20} aria-hidden />
      </button>
    </div>
  )
}
