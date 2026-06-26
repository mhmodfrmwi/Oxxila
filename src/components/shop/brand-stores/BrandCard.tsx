import { Link } from 'react-router-dom'
import { cn } from '../../../lib/cn'
import { cardHoverLiftClasses, focusRingClasses } from '../../ui/interactionStyles'
import type { BrandStore } from './brandStoresData'

interface BrandCardProps {
  brand: BrandStore
  className?: string
}

export function BrandCard({ brand, className }: BrandCardProps) {
  const { name, logo, logoAlt, href } = brand

  return (
    <Link
      to={href}
      className={cn(
        'group flex h-[4.5rem] w-full cursor-pointer items-center gap-3 overflow-hidden rounded-2xl px-4',
        'border border-border-subtle bg-card',
        'dark:border-transparent dark:bg-[#2c2945] dark:shadow-none',
        cardHoverLiftClasses,
        focusRingClasses,
        'sm:h-[4.75rem] sm:gap-3.5 sm:px-5',
        className,
      )}
    >
      <div className="h-[3.25rem] w-[3.25rem] shrink-0 overflow-hidden rounded-[10px]">
        <img
          src={logo}
          alt={logoAlt}
          className="h-full w-full object-cover"
          loading="lazy"
          draggable={false}
        />
      </div>

      <span
        className={cn(
          'min-w-0 font-serif text-[length:calc(var(--font-size-small)*0.875)] font-medium leading-tight text-primary-text',
          'line-clamp-2 sm:text-[length:calc(var(--font-size-small)*0.9375)]',
        )}
      >
        {name}
      </span>
    </Link>
  )
}
