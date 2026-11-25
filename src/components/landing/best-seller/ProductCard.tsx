// src/components/landing/best-seller/ProductCard.tsx
import { ProductBadge } from '../../ui/ProductBadge'
import { motion } from 'framer-motion'
import { useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import favouriteIcon from '../../../assets/landing/home/favourite.svg'
import basketIcon from '../../../assets/landing/home/shopping-basket.svg'
import starIcon from '../../../assets/landing/home/star-fill.svg'
import { PRODUCTS_PATH } from '../../../config/routes'
import { useProductCardActions } from '../../../hooks/useProductCardActions'
import { cn } from '../../../lib/cn'
import { formatProductPrice } from '../../../utils/formatProductPrice'
import { formatReviewCount } from '../../../utils/formatReviewCount'
import { MaskIcon } from '../../ui/MaskIcon'
import type { CoverflowLayout } from './coverflowLayout'

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
  /** +1 / -1 for the fan's last move; 0 before any move. */
  direction: number
  layout: CoverflowLayout
  onSelect: () => void
}

const MOVE_TRANSITION = { duration: 0.6, ease: 'easeInOut' } as const
/** Jump straight to the new slot and fade in, so a wrapping card never sweeps back across the fan. */
const WRAP_TRANSITION = { duration: 0, opacity: { duration: 0.45, ease: 'easeOut', delay: 0.15 } } as const

function getCardMotion(offset: number, { steps, cardWidth }: CoverflowLayout) {
  const distance = Math.abs(offset)
  const direction = Math.sign(offset)

  if (distance >= steps.length) {
    const last = steps[steps.length - 1]
    return {
      x: direction * (last.x + cardWidth),
      y: last.y,
      rotate: direction * last.rotate,
      scale: last.scale,
      opacity: 0,
    }
  }

  const step = steps[distance]
  return {
    x: direction * step.x,
    y: step.y,
    rotate: direction * step.rotate,
    scale: step.scale,
    opacity: step.opacity,
  }
}

const actionButtonClasses = cn(
  'relative z-20 flex size-9 items-center justify-center rounded-[20px]',
  'bg-button-secondary text-icon-on-emphasis',
  'transition-[background-color,transform] duration-200 hover:scale-110 hover:bg-button-primary',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button-primary',
  'disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:scale-100',
)

export function ProductCard({ product, offset, isActive, direction, layout, onSelect }: ProductCardProps) {
  const { t, i18n } = useTranslation()
  const { wishlisted, wishlistPending, addingToCart, handleAddToCart, handleWishlistToggle } =
    useProductCardActions(product.id)
  const [prevOffset, setPrevOffset] = useState(offset)
  const [wrapped, setWrapped] = useState(false)
  if (offset !== prevOffset) {
    setPrevOffset(offset)
    // Moving forward shrinks every offset; a card whose offset grew instead wrapped around the loop.
    setWrapped(direction !== 0 && (offset - prevOffset) * direction > 0)
  }
  const motionProps = getCardMotion(offset, layout)
  const isVisible = Math.abs(offset) < layout.steps.length
  const { originalPrice } = product
  const hasDiscount = originalPrice != null && originalPrice > product.price

  function onWishlistClick(event: MouseEvent<HTMLButtonElement>) {
    void handleWishlistToggle(event)
  }

  function onCartClick(event: MouseEvent<HTMLButtonElement>) {
    void handleAddToCart(event)
  }

  function onTitleLinkClick(event: MouseEvent<HTMLAnchorElement>) {
    event.stopPropagation()
    if (!isActive) {
      event.preventDefault()
      onSelect()
    }
  }

  return (
    <motion.article
      initial={false}
      animate={wrapped ? { ...motionProps, opacity: [0, motionProps.opacity] } : motionProps}
      transition={wrapped ? WRAP_TRANSITION : MOVE_TRANSITION}
      className={cn(
        'group/card self-start justify-self-center [grid-area:1/1]',
        !isVisible && 'pointer-events-none',
        !product.slug && 'cursor-pointer',
      )}
      style={{ width: layout.cardWidth, zIndex: 30 - Math.abs(offset) * 10 }}
      onClick={onSelect}
      aria-hidden={!isVisible}
    >
      <div
        dir={i18n.dir()}
        className={cn(
          'relative flex flex-col gap-2 overflow-hidden rounded-small bg-background p-2',
          'transition-[transform,box-shadow] duration-300 ease-out motion-reduce:transition-none',
          isActive && 'shadow-[0_18px_40px_-22px_rgb(0_0_0/0.35)]',
          isActive &&
            '[@media(hover:hover)]:group-hover/card:-translate-y-2 [@media(hover:hover)]:group-hover/card:shadow-xl [@media(hover:hover)]:group-hover/card:shadow-black/10',
        )}
      >
        <div className="relative px-[5px] py-2">
          <div className="relative aspect-[202/234] overflow-hidden rounded-medium bg-surface-muted">
            <img
              src={product.image}
              alt={product.title}
              className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105 motion-reduce:transition-none"
              loading="lazy"
              draggable={false}
            />
            {/* Inside the image frame so it always sits a clear 10px from the top/right edges. */}
            <span className="pointer-events-none absolute right-2.5 top-2.5 z-10">
              <ProductBadge kind="bestSeller" size="sm">
                {t('home.bestSellers.badge')}
              </ProductBadge>
            </span>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-2">
              <button
                type="button"
                aria-label={
                  wishlisted ? t('wishlist.removeFromWishlist') : t('home.bestSellers.addToWishlist')
                }
                aria-pressed={wishlisted}
                disabled={wishlistPending}
                onClick={onWishlistClick}
                tabIndex={isActive ? 0 : -1}
                className={cn(actionButtonClasses, wishlisted && 'bg-button-primary')}
              >
                <MaskIcon src={favouriteIcon} width={21.4992} height={19.5003} frame={24} />
              </button>
              <button
                type="button"
                aria-label={t('actions.addToCart')}
                disabled={addingToCart}
                onClick={onCartClick}
                tabIndex={isActive ? 0 : -1}
                className={actionButtonClasses}
              >
                <MaskIcon src={basketIcon} width={20.5} height={21.5} frame={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="landing-type flex flex-col gap-2 px-1 pb-1">
          <h3
            className="landing-fixed-text line-clamp-2 min-h-[2.4em] text-primary-text [--landing-size:1rem] [overflow-wrap:anywhere]"
            title={product.title}
          >
            {product.slug ? (
              <Link
                to={`${PRODUCTS_PATH}/${product.slug}`}
                onClick={onTitleLinkClick}
                tabIndex={isActive ? 0 : -1}
                draggable={false}
                className="after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-small focus-visible:after:ring-2 focus-visible:after:ring-button-primary"
              >
                {product.title}
              </Link>
            ) : (
              product.title
            )}
          </h3>

          <div className="flex flex-wrap items-center justify-between gap-x-2.5 gap-y-1">
            <p className="flex items-baseline gap-1.5">
              <span className="landing-fixed-text text-icon-primary [--landing-size:1rem]">
                {formatProductPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="landing-fixed-text text-helper-text line-through [--landing-size:0.8125rem]">
                  {formatProductPrice(originalPrice)}
                </span>
              )}
            </p>
            <div className="flex shrink-0 items-center gap-1.5 text-helper-text">
              <img src={starIcon} alt="" width={16} height={16} className="size-4" />
              <span className="landing-fixed-text [--landing-size:0.8125rem]">
                {product.rating}{' '}
                <span className="landing-fixed-text [--landing-size:0.75rem]">
                  ({formatReviewCount(product.reviewCount)})
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
