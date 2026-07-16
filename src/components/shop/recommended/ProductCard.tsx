// src/components/shop/recommended/ProductCard.tsx
import { Heart, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useProductCardActions } from '../../../hooks/useProductCardActions'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import { IconActionButton } from '../../ui/IconActionButton'
import { ProductBadge } from '../../ui/ProductBadge'
import { ProductRating } from '../../ui/ProductRating'
import { formatProductPrice } from '../../../utils/formatProductPrice'
import { PRODUCT_IMAGE_PLACEHOLDER } from '../../../utils/productImage'
import type { RecommendedProduct } from './recommendedProductsData'

interface ProductCardProps {
  product: RecommendedProduct
  layout?: 'carousel' | 'grid'
  /** Wishlist Figma layout — does not affect Shop/Home/Category cards. */
  variant?: 'default' | 'wishlist'
  className?: string
}

const carouselWidthClasses =
  'w-[168px] shrink-0 sm:w-[184px] md:w-[196px] lg:w-[212px]'

const carouselImageHeightClasses =
  'h-[168px] sm:h-[184px] md:h-[196px] lg:h-[212px]'

export function ProductCard({
  product,
  layout = 'carousel',
  variant = 'default',
  className,
}: ProductCardProps) {
  const { t } = useTranslation()
  const {
    wishlisted,
    wishlistPending,
    addingToCart,
    handleAddToCart,
    handleWishlistToggle,
  } = useProductCardActions(product.id)
  const { brand, title, price, originalPrice, rating, reviewCount, image, imageAlt, badge, href } =
    product
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  const imageSrc = failedImageUrl === image ? PRODUCT_IMAGE_PLACEHOLDER : image

  const isGrid = layout === 'grid'
  const isWishlist = variant === 'wishlist'
  const outOfStock = product.stock != null && product.stock <= 0
  const showWishlistRating = rating > 0 || reviewCount > 0

  return (
    <article
      className={cn(
        'group/card',
        isWishlist && 'wishlist-product-card',
        isGrid ? 'min-w-0 w-full' : carouselWidthClasses,
        className,
      )}
    >
      <div className="relative">
        <Link
          to={href}
          className={cn('block', focusRingClasses)}
          aria-label={brand ? `${brand} ${title}` : title}
        >
          <div
            className={cn(
              'product-card-frame relative overflow-hidden',
              isWishlist
                ? 'wishlist-product-frame'
                : cn(
                    'rounded-[20px] border border-border-subtle',
                    'shadow-sm shadow-black/[0.04] transition-[transform,box-shadow] duration-500 ease-out',
                    'dark:shadow-none',
                    '[@media(hover:hover)]:group-hover/card:-translate-y-1',
                    '[@media(hover:hover)]:group-hover/card:shadow-lg [@media(hover:hover)]:group-hover/card:shadow-black/10',
                    'dark:[@media(hover:hover)]:group-hover/card:shadow-black/30',
                  ),
            )}
          >
            {badge && (
              <span className={cn('absolute z-10', isWishlist ? 'start-2.5 top-2.5' : 'start-3 top-3')}>
                {isWishlist ? (
                  <span className="wishlist-product-badge">{badge}</span>
                ) : (
                  <ProductBadge>{badge}</ProductBadge>
                )}
              </span>
            )}

            <div
              className={cn(
                'w-full overflow-hidden',
                isWishlist
                  ? 'wishlist-product-image'
                  : isGrid
                    ? 'aspect-square'
                    : carouselImageHeightClasses,
              )}
            >
              <img
                src={imageSrc}
                alt={imageAlt}
                className={cn(
                  isWishlist
                    ? 'transition-transform duration-500 ease-out group-hover/card:scale-[1.03]'
                    : 'h-full w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.04]',
                )}
                loading="lazy"
                draggable={false}
                onError={() => {
                  if (failedImageUrl !== image) {
                    setFailedImageUrl(image)
                  }
                }}
              />
            </div>
          </div>
        </Link>

        <IconActionButton
          icon={Heart}
          label={
            wishlisted
              ? t('wishlist.removeFromWishlist')
              : t('shop.product.addToWishlist')
          }
          filled={wishlisted}
          disabled={wishlistPending}
          size={isWishlist ? 'sm' : 'md'}
          onClick={(event) => {
            void handleWishlistToggle(event)
          }}
          className={cn(
            'absolute z-10',
            isWishlist ? 'wishlist-action-btn bottom-2.5 start-2.5' : 'bottom-3 start-3',
          )}
        />

        <IconActionButton
          icon={ShoppingBag}
          label={outOfStock ? t('wishlist.outOfStock') : t('actions.addToCart')}
          onClick={(event) => {
            void handleAddToCart(event)
          }}
          disabled={addingToCart || outOfStock}
          size={isWishlist ? 'sm' : 'md'}
          className={cn(
            'absolute z-10',
            isWishlist ? 'wishlist-action-btn end-2.5 bottom-2.5' : 'end-3 bottom-3',
          )}
        />
      </div>

      {isWishlist ? (
        <div className="wishlist-product-info">
          <h3 className="wishlist-product-title">
            <Link to={href} className={cn('hover:underline', focusRingClasses)}>
              {brand ? `${brand} ${title}` : title}
            </Link>
          </h3>

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
      ) : (
        <div className="mt-3 space-y-2">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm leading-snug text-primary-text">
            <Link to={href} className={cn('hover:underline', focusRingClasses)}>
              <span className="font-semibold">{brand}</span>{' '}
              <span className="font-normal">{title}</span>
            </Link>
          </h3>

          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-base font-semibold text-primary-text">
                {formatProductPrice(price)}
              </span>
              {originalPrice != null && (
                <span className="text-sm text-secondary-text line-through">
                  {formatProductPrice(originalPrice)}
                </span>
              )}
            </div>

            <ProductRating rating={rating} reviewCount={reviewCount} />
          </div>
        </div>
      )}
    </article>
  )
}
