// src/components/landing/best-seller/ProductCard.tsx
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import type { MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PRODUCTS_PATH } from '../../../config/routes'
import { useProductCardActions } from '../../../hooks/useProductCardActions'
import { formatReviewCount } from '../../../utils/formatReviewCount'

export interface BestSellerProduct {
  id: string
  title: string
  price: number
  /** Compare-at price when a genuine discount exists. */
  originalPrice?: number
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
  const { t } = useTranslation()
  const {
    wishlisted,
    wishlistPending,
    addingToCart,
    handleAddToCart,
    handleWishlistToggle,
  } = useProductCardActions(product.id)
  const motionProps = getCardMotion(offset, isMobile)
  const isVisible = isMobile ? offset === 0 : Math.abs(offset) <= 2

  function onWishlistClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    void handleWishlistToggle(event)
  }

  function onCartClick(event: MouseEvent<HTMLButtonElement>) {
    void handleAddToCart(event)
  }

  const cardContent = (
    <div
      className={[
        'overflow-hidden rounded-[24px] border p-3',
        'bg-card/90 shadow-xl shadow-black/5 backdrop-blur-sm',
        'border-border-subtle/80',
        'transition-shadow duration-300',
        isActive ? 'shadow-accent/10' : '',
        product.slug ? 'cursor-pointer' : '',
      ].join(' ')}
    >
      <div className="relative overflow-hidden rounded-2xl bg-surface-muted">
        <span className="absolute start-3 top-3 z-10 rounded-full bg-accent-muted/70 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-primary-text uppercase">
          {t('home.bestSellers.badge')}
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
          aria-label={
            wishlisted
              ? t('wishlist.removeFromWishlist')
              : t('home.bestSellers.addToWishlist')
          }
          aria-pressed={wishlisted}
          disabled={wishlistPending}
          onClick={onWishlistClick}
          className={[
            'absolute bottom-3 start-3 z-10 flex h-11 w-11 items-center justify-center rounded-full',
            'bg-card/90 text-icon-secondary shadow-md',
            'transition-all duration-200 hover:scale-110 hover:bg-button-primary hover:text-on-emphasis',
            'disabled:pointer-events-none disabled:opacity-60',
            wishlisted ? 'bg-button-primary text-on-emphasis' : '',
          ].join(' ')}
        >
          <Heart size={16} aria-hidden fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        <button
          type="button"
          aria-label={t('actions.addToCart')}
          onClick={onCartClick}
          disabled={addingToCart}
          className={[
            'absolute end-3 bottom-3 z-10 flex h-11 w-11 items-center justify-center rounded-full',
            'bg-card/90 text-icon-secondary shadow-md',
            'transition-all duration-200 hover:scale-110 hover:bg-button-primary hover:text-on-emphasis',
            'disabled:pointer-events-none disabled:opacity-60',
          ].join(' ')}
        >
          <ShoppingBag size={16} aria-hidden />
        </button>
      </div>

      <div className="space-y-2.5 pt-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm leading-snug font-medium text-primary-text">
          {product.title}
        </h3>

        <div className="flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-primary-text">
              ${product.price}
            </span>
            {product.originalPrice != null && product.originalPrice > product.price && (
              <span className="text-sm text-secondary-text line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1 text-xs text-secondary-text">
            <Star size={12} className="fill-support-warning text-support-warning" aria-hidden />
            <span>
              {product.rating} ({formatReviewCount(product.reviewCount)})
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <motion.article
      layout
      animate={motionProps}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className={[
        'absolute top-0 left-1/2 w-[min(260px,85vw)] -translate-x-1/2 sm:w-[280px]',
        'group/card',
        !isVisible ? 'pointer-events-none' : '',
        !product.slug ? 'cursor-pointer' : '',
      ].join(' ')}
      style={{ zIndex: motionProps.zIndex }}
      onClick={onSelect}
      whileHover={isActive ? { y: -8 } : undefined}
    >
      {product.slug ? (
        <Link
          to={`${PRODUCTS_PATH}/${product.slug}`}
          className="block"
          onClick={(event) => event.stopPropagation()}
        >
          {cardContent}
        </Link>
      ) : (
        cardContent
      )}
    </motion.article>
  )
}
