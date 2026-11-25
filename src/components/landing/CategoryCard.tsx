// src/components/landing/CategoryCard.tsx
import { Link } from 'react-router-dom'
import arrowUpRightIcon from '../../assets/landing/home/arrow-up-right.svg'
import { cn } from '../../lib/cn'
import { cardHoverLiftClasses, focusRingClasses } from '../ui/interactionStyles'
import { MaskIcon } from '../ui/MaskIcon'

interface CategoryCardProps {
  name: string
  image: string
  href?: string
  layout?: 'grid' | 'carousel'
  className?: string
}

const CAROUSEL_WIDTH = 'w-[min(200px,52vw)] shrink-0 sm:w-[220px]'

export function CategoryCard({
  name,
  image,
  href,
  layout = 'grid',
  className,
}: CategoryCardProps) {
  const isCarousel = layout === 'carousel'

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <h3 className="landing-type landing-text-base line-clamp-2 min-w-0 self-center text-primary-text [overflow-wrap:anywhere]">
          {name}
        </h3>
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full',
            'bg-button-secondary text-icon-on-emphasis',
            'transition-colors duration-200 ease-out motion-reduce:transition-none',
            'group-hover:bg-button-primary',
          )}
          aria-hidden
        >
          <MaskIcon
            src={arrowUpRightIcon}
            width={13.5}
            height={13.5001}
            frame={24}
            className="rtl:-scale-x-100"
          />
        </span>
      </div>
      {/* mt-auto keeps images aligned across a row when some titles wrap to two lines. */}
      <div className="mt-auto overflow-hidden rounded-extra-small">
        <img
          src={image}
          alt={name}
          className="aspect-[168/156] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none"
          loading="lazy"
          draggable={false}
        />
      </div>
    </>
  )

  const cardClassName = cn(
    'group relative flex flex-col gap-2 overflow-hidden rounded-medium bg-card p-4',
    'motion-reduce:transition-none',
    cardHoverLiftClasses,
    focusRingClasses,
    isCarousel ? cn(CAROUSEL_WIDTH, 'h-full') : 'h-full min-w-0 w-full',
    className,
  )

  if (href) {
    return (
      <Link to={href} className={cardClassName} draggable={false}>
        {content}
      </Link>
    )
  }

  return <article className={cardClassName}>{content}</article>
}
