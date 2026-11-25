// src/components/shop/PromotionCard.tsx
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../ui/interactionStyles'
import type { ShopPromotion } from './moreReasonsData'

interface PromotionCardProps {
  promotion: ShopPromotion
  className?: string
  /** Desktop bento vs equal-sized mobile/tablet carousel cards. */
  presentation?: 'grid' | 'carousel'
}

export function PromotionCard({
  promotion,
  className,
  presentation = 'grid',
}: PromotionCardProps) {
  const { title, subtitle, image, imageAlt, href, badge, imageCropClassName } =
    promotion
  const isCarousel = presentation === 'carousel'

  return (
    <Link
      to={href}
      draggable={false}
      className={cn(
        'group flex min-h-0 cursor-pointer flex-col overflow-hidden bg-card',
        'transition-[transform,box-shadow] duration-500 ease-out',
        '[@media(hover:hover)]:hover:scale-[1.015]',
        focusRingClasses,
        isCarousel
          ? // Equal flex items — peek next card via 70vw / 40vw widths
            'snap-start w-[70vw] max-w-[260px] shrink-0 grow-0 basis-[70vw] max-[379px]:max-w-[220px] gap-1.5 rounded-[12px] px-3 py-3 sm:w-[40vw] sm:max-w-none sm:basis-[40vw]'
          : 'h-full gap-2 rounded-small px-4 py-4 rtl:gap-3 rtl:px-5 rtl:py-5',
        className,
      )}
    >
      <div
        className={cn(
          'shrink-0 leading-[1.2]',
          isCarousel && 'min-h-[2.5rem]',
        )}
      >
        <h3
          className={cn(
            // Arabic falls back to a plain sans, so it needs weight + size to carry the card.
            'font-display font-normal text-primary-text rtl:font-bold rtl:leading-snug',
            isCarousel
              ? 'line-clamp-2 text-[length:calc(var(--font-size-extra-small)*1.05)] sm:text-extra-small'
              : 'text-small rtl:text-[1.125rem]',
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            'font-display font-normal text-secondary-text rtl:mt-0.5 rtl:font-medium',
            isCarousel
              ? 'mt-0.5 line-clamp-2 text-[11px] leading-snug sm:text-[length:calc(var(--font-size-extra-small)*0.9)]'
              : 'text-extra-small rtl:text-[0.9375rem]',
          )}
        >
          {subtitle}
        </p>
        {badge && (
          <span className="mt-2 inline-flex rounded-full bg-button-primary px-2.5 py-0.5 text-extra-small text-on-emphasis">
            {badge}
          </span>
        )}
      </div>

      <div
        className={cn(
          'relative w-full overflow-hidden',
          isCarousel
            ? 'aspect-square shrink-0 rounded-[6px]'
            : 'min-h-0 flex-1 rounded-extra-small',
        )}
      >
        <img
          src={image}
          alt={imageAlt}
          draggable={false}
          className={cn(
            'pointer-events-none transition-transform duration-500 ease-out group-hover:scale-[1.03]',
            isCarousel || !imageCropClassName
              ? 'absolute inset-0 size-full object-cover object-center'
              : imageCropClassName,
          )}
          loading="lazy"
        />
      </div>
    </Link>
  )
}
