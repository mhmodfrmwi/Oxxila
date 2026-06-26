import { Heart, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
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
  className?: string
}

const carouselWidthClasses =
  'w-[168px] shrink-0 sm:w-[184px] md:w-[196px] lg:w-[212px]'

const carouselImageHeightClasses =
  'h-[168px] sm:h-[184px] md:h-[196px] lg:h-[212px]'

export function ProductCard({ product, layout = 'carousel', className }: ProductCardProps) {
  const { brand, title, price, originalPrice, rating, reviewCount, image, imageAlt, badge, href } =
    product
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  const imageSrc = failedImageUrl === image ? PRODUCT_IMAGE_PLACEHOLDER : image

  const isGrid = layout === 'grid'

  return (
    <article
      className={cn(
        'group/card',
        isGrid ? 'min-w-0 w-full' : carouselWidthClasses,
        className,
      )}
    >
      <Link
        to={href}
        className={cn('block', focusRingClasses)}
      >
        <div
          className={cn(
            'product-card-frame relative overflow-hidden rounded-[20px] border border-border-subtle',
            'shadow-sm shadow-black/[0.04] transition-[transform,box-shadow] duration-500 ease-out',
            'dark:shadow-none',
            '[@media(hover:hover)]:group-hover/card:-translate-y-1',
            '[@media(hover:hover)]:group-hover/card:shadow-lg [@media(hover:hover)]:group-hover/card:shadow-black/10',
            'dark:[@media(hover:hover)]:group-hover/card:shadow-black/30',
          )}
        >
          {badge && (
            <span className="absolute top-3 left-3 z-10">
              <ProductBadge>{badge}</ProductBadge>
            </span>
          )}

          <div
            className={cn(
              'w-full overflow-hidden',
              isGrid ? 'aspect-square' : carouselImageHeightClasses,
            )}
          >
            <img
              src={imageSrc}
              alt={imageAlt}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.04]"
              loading="lazy"
              draggable={false}
              onError={() => {
                if (failedImageUrl !== image) {
                  setFailedImageUrl(image)
                }
              }}
            />
          </div>

          <IconActionButton
            icon={Heart}
            label="Add to wishlist"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
            }}
            className="absolute bottom-3 left-3 z-10"
          />

          <IconActionButton
            icon={ShoppingBag}
            label="Add to cart"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
            }}
            className="absolute right-3 bottom-3 z-10"
          />
        </div>

        <div className="mt-3 space-y-2">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm leading-snug text-primary-text">
            <span className="font-semibold">{brand}</span>{' '}
            <span className="font-normal">{title}</span>
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
      </Link>
    </article>
  )
}
