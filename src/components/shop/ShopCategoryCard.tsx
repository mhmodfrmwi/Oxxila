import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../ui/interactionStyles'
import { typeSmallClasses } from '../ui/typography'

const CAROUSEL_WIDTH =
  'w-[100px] shrink-0 min-[480px]:w-[112px] min-[640px]:w-[120px]'

interface CategoryCardImageProps {
  src: string
  alt: string
}

function CategoryCardImage({ src, alt }: CategoryCardImageProps) {
  return (
    <div className="relative overflow-hidden rounded-input">
      <img
        src={src}
        alt={alt}
        className="aspect-[4/5] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        loading="lazy"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%] bg-gradient-to-t from-background via-background/30 to-transparent"
        aria-hidden
      />
    </div>
  )
}

interface CategoryCardLabelProps {
  name: string
  compact?: boolean
}

function CategoryCardLabel({ name, compact }: CategoryCardLabelProps) {
  return (
    <p
      className={cn(
        'mt-1.5 text-center text-primary-text',
        typeSmallClasses,
        !compact && 'line-clamp-2',
        compact
          ? 'text-[length:calc(var(--font-size-small)*0.875)] leading-[var(--line-height-small)]'
          : 'text-[length:calc(var(--font-size-small)*0.8125)] leading-[1.25] min-[1280px]:text-[length:calc(var(--font-size-small)*0.9)]',
      )}
    >
      {name}
    </p>
  )
}

interface ShopCategoryCardProps {
  name: string
  image: string
  href: string
  layout?: 'carousel' | 'grid'
  className?: string
}

export function ShopCategoryCard({
  name,
  image,
  href,
  layout = 'carousel',
  className,
}: ShopCategoryCardProps) {
  const isGrid = layout === 'grid'

  return (
    <Link
      to={href}
      className={cn(
        'group block',
        focusRingClasses,
        isGrid ? 'min-w-0 flex-1' : CAROUSEL_WIDTH,
        className,
      )}
    >
      <CategoryCardImage src={image} alt={name} />
      <CategoryCardLabel name={name} compact={!isGrid} />
    </Link>
  )
}
