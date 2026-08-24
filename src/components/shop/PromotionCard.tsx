// src/components/shop/PromotionCard.tsx
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../ui/interactionStyles'
import type { ShopPromotion } from './moreReasonsData'

interface PromotionCardProps {
  promotion: ShopPromotion
  className?: string
}

const imageAspect: Record<ShopPromotion['layout'], string> = {
  compact: 'aspect-[5/4] w-full',
  tall: 'relative min-h-[220px] w-full flex-1 lg:min-h-0',
  wide: 'aspect-[21/9] w-full sm:aspect-[2.15/1]',
}

export function PromotionCard({ promotion, className }: PromotionCardProps) {
  const { title, subtitle, image, imageAlt, href, layout, badge } = promotion

  return (
    <Link
      to={href}
      className={cn(
        'group flex h-full min-h-0 cursor-pointer flex-col overflow-hidden rounded-card bg-card',
        'border border-transparent shadow-md shadow-black/[0.06]',
        'dark:border-border-subtle dark:shadow-none',
        'transition-[transform,box-shadow] duration-500 ease-out',
        '[@media(hover:hover)]:hover:scale-[1.02]',
        '[@media(hover:hover)]:hover:shadow-lg [@media(hover:hover)]:hover:shadow-black/10',
        'dark:[@media(hover:hover)]:hover:border-border-subtle dark:[@media(hover:hover)]:hover:shadow-none',
        focusRingClasses,
        layout === 'tall' && 'lg:min-h-0',
        className,
      )}
    >
      <div className="shrink-0 px-6 pt-6 pb-3">
        <h3 className="font-serif text-[length:var(--font-size-small)] font-medium leading-tight text-primary-text sm:text-[length:calc(var(--font-size-small)*1.05)]">
          {title}
        </h3>
        <p className="mt-1 text-[length:calc(var(--font-size-small)*0.85)] leading-[var(--line-height-small)] text-secondary-text sm:text-[length:calc(var(--font-size-small)*0.9)]">
          {subtitle}
        </p>
        {badge && (
          <span className="mt-2 inline-flex rounded-full bg-button-primary px-2.5 py-0.5 text-[length:calc(var(--font-size-small)*0.75)] text-on-emphasis">
            {badge}
          </span>
        )}
      </div>

      <div
        className={cn(
          'mt-auto px-6 pb-6',
          layout === 'tall' && 'flex min-h-0 flex-1 flex-col',
        )}
      >
        <div
          className={cn(
            'relative overflow-hidden rounded-input',
            imageAspect[layout],
          )}
        >
          <img
            src={image}
            alt={imageAlt}
            className={cn(
              'object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]',
              layout === 'tall'
                ? 'absolute inset-0 h-full w-full'
                : 'h-full w-full',
            )}
            loading="lazy"
          />
        </div>
      </div>
    </Link>
  )
}
