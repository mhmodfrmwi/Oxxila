import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { cardHoverLiftClasses, focusRingClasses } from '../ui/interactionStyles'
import { Heading } from '../ui/Heading'

interface CategoryCardProps {
  name: string
  image: string
  href?: string
  layout?: 'grid' | 'carousel'
  className?: string
}

const CAROUSEL_WIDTH =
  'w-[min(200px,78vw)] shrink-0 min-[480px]:w-[210px]'

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
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-3.5">
        <Heading variant="card-sm" className="min-w-0 leading-snug">
          {name}
        </Heading>
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
            'bg-button-primary-hover text-icon-secondary',
            'transition-colors duration-200 ease-out',
            'group-hover:bg-button-primary group-hover:text-on-emphasis',
            'dark:bg-button-primary/70 dark:text-on-emphasis',
            'dark:group-hover:bg-button-primary',
          )}
          aria-hidden
        >
          <ArrowUpRight size={15} strokeWidth={2.25} />
        </span>
      </div>
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <img
          src={image}
          alt={name}
          className="aspect-square w-full rounded-2xl object-cover"
          loading="lazy"
          draggable={false}
        />
      </div>
    </>
  )

  const cardClassName = cn(
    'group relative flex flex-col overflow-hidden rounded-3xl',
    'bg-card border border-transparent',
    'motion-reduce:transition-none',
    'dark:border-transparent dark:bg-[#2d2b3d] dark:shadow-none',
    cardHoverLiftClasses,
    focusRingClasses,
    isCarousel ? CAROUSEL_WIDTH : 'h-full min-w-0 w-full',
    className,
  )

  if (href) {
    return (
      <Link to={href} className={cardClassName}>
        {content}
      </Link>
    )
  }

  return <article className={cardClassName}>{content}</article>
}
