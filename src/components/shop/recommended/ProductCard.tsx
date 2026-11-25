// src/components/shop/recommended/ProductCard.tsx
import { Check, Heart, Loader2, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import favouriteIcon from '../../../assets/landing/home/favourite.svg'
import basketIcon from '../../../assets/landing/home/shopping-basket.svg'
import starIcon from '../../../assets/landing/home/star-fill.svg'
import { useProductCardActions } from '../../../hooks/useProductCardActions'
import { cn } from '../../../lib/cn'
import { formatProductPrice } from '../../../utils/formatProductPrice'
import { formatReviewCount } from '../../../utils/formatReviewCount'
import { stripLeadingBrandFromName } from '../../../utils/productDisplayName'
import { PRODUCT_IMAGE_PLACEHOLDER } from '../../../utils/productImage'
import { focusRingClasses } from '../../ui/interactionStyles'
import { IconActionButton } from '../../ui/IconActionButton'
import { MaskIcon } from '../../ui/MaskIcon'
import { ProductBadge } from '../../ui/ProductBadge'
import { ProductRating } from '../../ui/ProductRating'
import type { RecommendedProduct } from './recommendedProductsData'

interface ProductCardProps {
  product: RecommendedProduct
  layout?: 'carousel' | 'grid'
  /** Wishlist Figma layout — does not affect Shop/Home/Category cards. */
  variant?: 'default' | 'wishlist'
  className?: string
  /** Render the "why recommended" chip (rails driven by /related and /recommendations). */
  showReason?: boolean
}

/**
 * Rail card width: Figma 228px base, scaled so two cards fit a 390px phone
 * and a fifth peeks on desktop rails.
 */
const carouselWidthClasses = 'w-[clamp(184px,58vw,248px)] shrink-0'

/** Figma action frames — 32×32 carousel; grid/mobile ≥40px for touch. */
const actionButtonClasses = cn(
  'flex items-center justify-center rounded-[20px] p-2',
  'bg-button-secondary text-icon-on-emphasis',
  'transition-[background-color,transform] duration-200 hover:scale-105 hover:bg-button-primary',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button-primary',
  'disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:scale-100',
)

/** One action size for every card layout (rail and grid) so icons never differ between sections. */
const carouselActionSize = 'size-9'
/** Phones: 36px so the heart + stepper fit a ~165px card; sm+: roomy 44px touch targets. */
const gridActionSize = 'size-9'

export function ProductCard({
  product,
  layout = 'carousel',
  variant = 'default',
  className,
  showReason = false,
}: ProductCardProps) {
  const { t, i18n } = useTranslation()
  const {
    wishlisted,
    wishlistPending,
    addingToCart,
    justAdded,
    cartQuantity,
    updatingQty,
    handleAddToCart,
    handleIncrement,
    handleDecrement,
    handleWishlistToggle,
  } = useProductCardActions(product.id)
  const dir = i18n.dir()
  const { brand, title, price, originalPrice, rating, reviewCount, image, imageAlt, badge, href } =
    product
  const displayTitle = stripLeadingBrandFromName(brand, title)
  const badgeLabel = badge ? t(`productDetail.badge.${badge}`, { defaultValue: badge }) : ''
  const showBrand = Boolean(brand.trim())
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  const imageSrc = failedImageUrl === image ? PRODUCT_IMAGE_PLACEHOLDER : image
  // Track *which* src finished loading — a boolean reset in an effect races
  // cached images whose onLoad fires before the effect, leaving a gray box.
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const imageLoaded = loadedSrc === imageSrc
  const markLoaded = useCallback(() => setLoadedSrc(imageSrc), [imageSrc])
  const imageRef = useCallback(
    (node: HTMLImageElement | null) => {
      if (node?.complete && node.naturalWidth > 0) setLoadedSrc(imageSrc)
    },
    [imageSrc],
  )

  const isGrid = layout === 'grid'
  const isWishlist = variant === 'wishlist'
  const outOfStock = product.stock != null && product.stock <= 0
  const showWishlistRating = rating > 0 || reviewCount > 0
  const hasDiscount = originalPrice != null && originalPrice > price

  if (isWishlist) {
    return (
      <article
        dir={dir}
        className={cn(
          'group/card wishlist-product-card',
          isGrid ? 'min-w-0 w-full' : carouselWidthClasses,
          className,
        )}
      >
        <div className="wishlist-product-media">
          <Link
            to={href}
            className={cn('block', focusRingClasses)}
            aria-label={showBrand ? `${brand} ${displayTitle}` : displayTitle}
          >
            <div className="product-card-frame relative overflow-hidden wishlist-product-frame">
              {badge && (
                <span className="absolute right-2.5 top-2.5 z-10">
                  <ProductBadge kind={badge} size="sm">
                    {badgeLabel}
                  </ProductBadge>
                </span>
              )}
              <div className="wishlist-product-image w-full overflow-hidden">
                <img
                  src={imageSrc}
                  alt={imageAlt}
                  className="transition-transform duration-500 ease-out group-hover/card:scale-[1.03]"
                  loading="lazy"
                  draggable={false}
                  onError={() => {
                    if (failedImageUrl !== image) setFailedImageUrl(image)
                  }}
                />
              </div>
            </div>
          </Link>

          <IconActionButton
            icon={Heart}
            label={wishlisted ? t('wishlist.removeFromWishlist') : t('shop.product.addToWishlist')}
            filled={wishlisted}
            disabled={wishlistPending}
            size="sm"
            onClick={(event) => {
              void handleWishlistToggle(event)
            }}
            className="wishlist-action-btn absolute bottom-2.5 start-2.5 z-10"
          />

          <IconActionButton
            icon={ShoppingBag}
            label={outOfStock ? t('wishlist.outOfStock') : t('actions.addToCart')}
            onClick={(event) => {
              void handleAddToCart(event)
            }}
            disabled={addingToCart || outOfStock}
            size="sm"
            className="wishlist-action-btn absolute end-2.5 bottom-2.5 z-10"
          />
        </div>

        <div className="wishlist-product-info">
          {showBrand ? <p className="wishlist-product-eyebrow">{brand}</p> : null}
          <h3 className="wishlist-product-title">
            <Link to={href} className={cn('hover:underline', focusRingClasses)}>
              {displayTitle}
            </Link>
          </h3>

          <div className="wishlist-product-meta">
            <div className="wishlist-product-prices">
              <span className="wishlist-product-price">{formatProductPrice(price)}</span>
              {originalPrice != null && (
                <span className="wishlist-product-price-old">
                  {formatProductPrice(originalPrice)}
                </span>
              )}
            </div>

            <div className="wishlist-product-rating">
              {showWishlistRating ? (
                <ProductRating
                  rating={rating}
                  reviewCount={reviewCount}
                  variant="wishlist"
                  starSize={11}
                />
              ) : null}
            </div>
          </div>
        </div>
      </article>
    )
  }

  const actionSize = isGrid ? gridActionSize : carouselActionSize
  const iconFrame = 20

  // Same visual language as landing best-seller cards.
  // No hover lift / background glow — static soft shadow only.
  return (
    <article
      dir={dir}
      className={cn(
        'group/card text-start',
        isGrid ? 'flex h-full min-w-0 w-full flex-col' : carouselWidthClasses,
        className,
      )}
    >
      <div
        className={cn(
          'relative flex h-full flex-col gap-2 overflow-hidden rounded-small bg-card',
          'border border-border-subtle',
          'shadow-[var(--catalog-card-shadow)]',
          'dark:border-white/20 dark:shadow-[var(--catalog-card-shadow-dark)]',
          isGrid ? 'p-1.5 sm:p-3' : 'p-2',
        )}
      >
        <div className={cn('relative', isGrid ? 'px-0 pt-0 sm:px-0.5 sm:pt-1' : 'px-[5px] py-2')}>
          {/* Grid: 1:1 for mobile width; carousel keeps Figma 228/250 */}
          <div
            className={cn(
              'product-card-frame relative w-full overflow-hidden rounded-medium',
              isGrid ? 'aspect-square max-[399px]:aspect-[4/3]' : 'aspect-[228/250]',
            )}
          >
            {!imageLoaded ? (
              <div
                className="absolute inset-0 animate-pulse bg-surface-muted"
                aria-hidden
              />
            ) : null}
            <img
              src={imageSrc}
              alt={imageAlt}
              className={cn(
                'absolute inset-0 size-full object-cover transition-opacity duration-300',
                imageLoaded ? 'opacity-100' : 'opacity-0',
              )}
              loading="lazy"
              draggable={false}
              ref={imageRef}
              onLoad={markLoaded}
              onError={() => {
                if (failedImageUrl !== image) setFailedImageUrl(image)
                else markLoaded()
              }}
            />

            {/* Overlay layer: wishlist heart bottom-start, cart/stepper bottom-end. */}
            <div className="pointer-events-none absolute inset-0 z-20">
              <button
                type="button"
                aria-label={
                  wishlisted ? t('wishlist.removeFromWishlist') : t('shop.product.addToWishlist')
                }
                aria-pressed={wishlisted}
                disabled={wishlistPending}
                onClick={(event) => {
                  void handleWishlistToggle(event)
                }}
                className={cn(
                  actionButtonClasses,
                  actionSize,
                  'pointer-events-auto absolute bottom-2 start-2',
                  wishlisted && 'bg-button-primary',
                )}
              >
                <MaskIcon
                  src={favouriteIcon}
                  width={20}
                  height={18}
                  frame={iconFrame}
                />
              </button>
              <div className="pointer-events-auto absolute bottom-2 end-2 flex">
              {justAdded ? (
                <span
                  role="status"
                  className={cn(
                    'relative z-20 flex h-9 items-center gap-1 rounded-[20px] bg-support-success px-3 text-xs font-medium text-white',
                    'animate-[card-added-in_0.25s_ease-out] motion-reduce:animate-none',
                  )}
                >
                  <Check size={16} strokeWidth={2.5} aria-hidden />
                  {t('cart.card.added')}
                </span>
              ) : cartQuantity > 0 ? (
                <div
                  className={cn(
                    'relative z-20 flex items-center gap-0.5 rounded-[20px] bg-button-primary p-0.5 text-white',
                    'h-9',
                  )}
                  role="group"
                  aria-label={t('cart.card.inCart', { count: cartQuantity })}
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      void handleDecrement(event)
                    }}
                    disabled={updatingQty}
                    aria-label={t('cart.card.decrease')}
                    className="flex aspect-square h-full items-center justify-center rounded-full transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
                  >
                    <Minus size={14} strokeWidth={2.5} aria-hidden />
                  </button>
                  <span className="min-w-5 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                    {updatingQty ? <Loader2 size={14} className="mx-auto animate-spin" aria-hidden /> : cartQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={(event) => {
                      void handleIncrement(event)
                    }}
                    disabled={updatingQty || (product.stock != null && cartQuantity >= product.stock)}
                    aria-label={t('cart.card.increase')}
                    className="flex aspect-square h-full items-center justify-center rounded-full transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-40"
                  >
                    <Plus size={14} strokeWidth={2.5} aria-hidden />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  aria-label={outOfStock ? t('wishlist.outOfStock') : t('actions.addToCart')}
                  disabled={addingToCart || outOfStock}
                  onClick={(event) => {
                    void handleAddToCart(event)
                  }}
                  className={cn(actionButtonClasses, actionSize)}
                >
                  {addingToCart ? (
                    <Loader2 size={18} className="animate-spin" aria-hidden />
                  ) : (
                    <MaskIcon
                      src={basketIcon}
                      width={20}
                      height={20}
                      frame={iconFrame}
                    />
                  )}
                </button>
              )}
              </div>
            </div>
          </div>

          {/* Only products that really are best sellers / certified / bundles get a badge. */}
          {badge ? (
            <span
              className={cn(
                'pointer-events-none absolute z-10 top-3',
                // The brand logo is printed top-left on the photos, so the badge sits top-right.
                isGrid ? 'right-3' : 'right-3 top-3',
              )}
            >
              <ProductBadge kind={badge} size={isGrid ? 'md' : 'sm'}>
                {badgeLabel}
              </ProductBadge>
            </span>
          ) : null}
        </div>

        <div
          className={cn(
            'relative flex flex-1 flex-col gap-2',
            isGrid ? 'px-0.5 pb-0.5' : 'px-1 pb-1',
          )}
        >
          {showReason && product.reason && product.reason !== 'popular' ? (
            <p className="w-fit rounded-full bg-button-primary/10 px-2 py-0.5 text-[11px] leading-[1.3] text-button-primary">
              {t(`shop.reason.${product.reason}`)}
            </p>
          ) : null}
          <h3
            className={cn(
              'line-clamp-2 text-primary-text [overflow-wrap:anywhere]',
              isGrid
                ? 'min-h-[2.6em] font-sans text-[15px] font-medium leading-[1.3] sm:text-base'
                : 'min-h-[2.4em] text-base leading-[1.2]',
            )}
            title={displayTitle}
          >
            <Link
              to={href}
              draggable={false}
              aria-label={showBrand ? `${brand} ${displayTitle}` : displayTitle}
              className="after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-small focus-visible:after:ring-2 focus-visible:after:ring-button-primary"
            >
              {displayTitle}
            </Link>
          </h3>

          <div
            className={cn(
              'relative z-20 flex flex-wrap items-center justify-between gap-x-2.5 gap-y-1',
              isGrid && 'mt-auto',
            )}
          >
            <p className="flex items-baseline gap-1.5 tracking-[0.2px]">
              <span
                className={cn(
                  'leading-[1.2] text-icon-primary',
                  isGrid ? 'text-base font-semibold' : 'text-base',
                )}
              >
                {formatProductPrice(price, i18n.language)}
              </span>
              {hasDiscount && (
                <span className="text-xs leading-[1.2] text-helper-text line-through">
                  {formatProductPrice(originalPrice, i18n.language)}
                </span>
              )}
            </p>

            <div className="flex shrink-0 items-center gap-1.5 text-helper-text">
              <img src={starIcon} alt="" width={16} height={16} className="size-4" />
              <span
                className={cn(
                  'whitespace-nowrap leading-[1.2]',
                  isGrid ? 'text-[13px] sm:text-sm' : 'text-xs',
                )}
              >
                {rating}{' '}
                <span className="text-[10px] leading-[1.2]">
                  ({formatReviewCount(reviewCount)})
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
