import { Heart, ShoppingBag, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import { formatProductPrice } from '../../../utils/formatProductPrice'
import { formatReviewCount } from '../../../utils/formatReviewCount'
import type { RecommendedProduct } from './recommendedProductsData'

interface ProductCardProps {
  product: RecommendedProduct
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { brand, title, price, originalPrice, rating, reviewCount, image, imageAlt, badge, href } =
    product

  return (
    <article
      className={cn(
        'group/card w-[168px] shrink-0 sm:w-[184px] md:w-[196px] lg:w-[212px]',
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
            <span
              className={cn(
                'absolute top-3 left-3 z-10 rounded-full px-2.5 py-1',
                'text-[10px] font-medium tracking-wide uppercase',
                'bg-button-primary-hover text-primary-text',
                'dark:bg-button-primary dark:text-on-emphasis',
              )}
            >
              {badge}
            </span>
          )}

          <div className="h-[168px] w-full overflow-hidden sm:h-[184px] md:h-[196px] lg:h-[212px]">
            <img
              src={image}
              alt={imageAlt}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.04]"
              loading="lazy"
              draggable={false}
            />
          </div>

          <button
            type="button"
            aria-label="Add to wishlist"
            onClick={(event) => event.preventDefault()}
            className={cn(
              'absolute bottom-3 left-3 z-10 flex h-10 w-10 items-center justify-center rounded-full',
              'bg-button-primary text-on-emphasis shadow-md shadow-black/10',
              'transition-transform duration-200 [@media(hover:hover)]:hover:scale-110',
            )}
          >
            <Heart size={16} aria-hidden />
          </button>

          <button
            type="button"
            aria-label="Add to cart"
            onClick={(event) => event.preventDefault()}
            className={cn(
              'absolute right-3 bottom-3 z-10 flex h-10 w-10 items-center justify-center rounded-full',
              'bg-button-primary text-on-emphasis shadow-md shadow-black/10',
              'transition-transform duration-200 [@media(hover:hover)]:hover:scale-110',
            )}
          >
            <ShoppingBag size={16} aria-hidden />
          </button>
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

            <div className="flex shrink-0 items-center gap-1 text-xs text-secondary-text">
              <Star size={12} className="fill-support-warning text-support-warning" aria-hidden />
              <span>
                {rating} ({formatReviewCount(reviewCount)})
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
