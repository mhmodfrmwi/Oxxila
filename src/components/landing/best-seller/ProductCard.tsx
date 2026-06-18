import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Star } from 'lucide-react'

export interface BestSellerProduct {
  id: string
  title: string
  price: number
  originalPrice: number
  rating: number
  reviewCount: number
  image: string
  slug?: string
}

interface ProductCardProps {
  product: BestSellerProduct
  offset: number
  isActive: boolean
  isMobile: boolean
  onSelect: () => void
}

function formatReviewCount(count: number) {
  if (count >= 1000) {
    const value = count / 1000
    return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}k`
  }
  return String(count)
}

function getCardMotion(offset: number, isMobile: boolean) {
  if (isMobile) {
    return offset === 0
      ? { x: 0, scale: 1, rotate: 0, opacity: 1, zIndex: 30 }
      : { x: offset * 40, scale: 0.92, rotate: 0, opacity: 0, zIndex: 0 }
  }

  const distance = Math.abs(offset)
  if (distance > 2) {
    return {
      x: offset * 200,
      scale: 0.6,
      rotate: offset > 0 ? 8 : -8,
      opacity: 0,
      zIndex: 0,
    }
  }

  const scale = distance === 0 ? 1 : distance === 1 ? 0.9 : 0.75
  const opacity = distance === 0 ? 1 : distance === 1 ? 0.8 : 0.2
  const rotate = offset === 0 ? 0 : offset > 0 ? 8 : -8
  const x = offset * 190

  return { x, scale, rotate, opacity, zIndex: 30 - distance * 10 }
}

export function ProductCard({
  product,
  offset,
  isActive,
  isMobile,
  onSelect,
}: ProductCardProps) {
  const motionProps = getCardMotion(offset, isMobile)
  const isVisible = isMobile ? offset === 0 : Math.abs(offset) <= 2

  return (
    <motion.article
      layout
      animate={motionProps}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className={[
        'absolute top-0 left-1/2 w-[min(260px,85vw)] -translate-x-1/2 cursor-pointer sm:w-[280px]',
        'group/card',
        !isVisible ? 'pointer-events-none' : '',
      ].join(' ')}
      style={{ zIndex: motionProps.zIndex }}
      onClick={onSelect}
      whileHover={isActive ? { y: -8 } : undefined}
    >
      <div
        className={[
          'overflow-hidden rounded-[24px] border p-3',
          'bg-white/90 shadow-xl shadow-black/5 backdrop-blur-sm',
          'border-border-light/80',
          'dark:border-white/10 dark:bg-[#1E1F2E]/75 dark:shadow-2xl dark:shadow-black/40 dark:backdrop-blur-xl',
          'transition-shadow duration-300',
          isActive ? 'dark:shadow-oxxila-accent/10' : '',
        ].join(' ')}
      >
        <div className="relative overflow-hidden rounded-2xl bg-[#E8E4F0] dark:bg-[#2A2B3D]">
          <span className="absolute top-3 left-3 z-10 rounded-full bg-[#C0B5DE]/70 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-[#5D4E8C] uppercase dark:bg-[#9886FF]/30 dark:text-[#E0D9FF]">
            Best seller
          </span>

          <div className="overflow-hidden">
            <img
              src={product.image}
              alt={product.title}
              className="aspect-[4/5] w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
              loading="lazy"
              draggable={false}
            />
          </div>

          <button
            type="button"
            aria-label="Add to wishlist"
            onClick={(e) => e.stopPropagation()}
            className={[
              'absolute bottom-3 left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full',
              'bg-white/90 text-oxxila-accent shadow-md',
              'transition-all duration-200 hover:scale-110 hover:bg-oxxila-accent hover:text-white',
              'dark:bg-[#9886FF]/25 dark:text-[#E0D9FF] dark:hover:bg-[#9886FF] dark:hover:text-white',
            ].join(' ')}
          >
            <Heart size={16} aria-hidden />
          </button>

          <button
            type="button"
            aria-label="Add to cart"
            onClick={(e) => e.stopPropagation()}
            className={[
              'absolute right-3 bottom-3 z-10 flex h-11 w-11 items-center justify-center rounded-full',
              'bg-white/90 text-oxxila-accent shadow-md',
              'transition-all duration-200 hover:scale-110 hover:bg-oxxila-accent hover:text-white',
              'dark:bg-[#9886FF]/25 dark:text-[#E0D9FF] dark:hover:bg-[#9886FF] dark:hover:text-white',
            ].join(' ')}
          >
            <ShoppingBag size={16} aria-hidden />
          </button>
        </div>

        <div className="space-y-2.5 pt-3">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm leading-snug font-medium text-[#2D2A4A] dark:text-white">
            {product.title}
          </h3>

          <div className="flex items-end justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-[#2D2A4A] dark:text-white">
                ${product.price}
              </span>
              <span className="text-sm text-text-secondary-light line-through dark:text-text-secondary-dark">
                ${product.originalPrice}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1 text-xs text-text-secondary-light dark:text-text-secondary-dark">
              <Star size={12} className="fill-[#F1C21B] text-[#F1C21B]" aria-hidden />
              <span>
                {product.rating} ({formatReviewCount(product.reviewCount)})
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
