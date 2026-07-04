// src/components/shop/ProductPromoCard.tsx
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { isExternalHref } from '../../utils/bannerMappers'
import { focusRingClasses } from '../ui/interactionStyles'
import type { ShopHeroSlide } from './shopData'

interface ProductPromoCardProps {
  slide: ShopHeroSlide
  isActive?: boolean
  className?: string
}

const bannerShellClasses = [
  'promo-banner block overflow-hidden rounded-card',
  'h-[min(360px,78vw)] w-[min(900px,96vw)]',
  'min-[640px]:h-[min(400px,68vw)] min-[640px]:w-[min(900px,96vw)]',
  /* ~8% smaller on laptop/small desktop; full size from 1536px */
  'min-[769px]:h-[396px] min-[769px]:w-[828px]',
  'min-[1536px]:h-[430px] min-[1536px]:w-[900px]',
  'border border-[color:var(--promo-border)] bg-[color:var(--promo-bg)]',
  'shadow-xl [box-shadow:0_20px_40px_var(--promo-shadow)]',
  'transition-[transform,box-shadow] duration-300 ease-out',
].join(' ')

const interactiveClasses = [
  'cursor-pointer',
  '[@media(hover:hover)]:hover:-translate-y-0.5',
  '[@media(hover:hover)]:hover:[box-shadow:0_24px_48px_var(--promo-shadow)]',
  focusRingClasses,
].join(' ')

const activeClasses =
  '[box-shadow:0_20px_40px_var(--promo-shadow),0_0_0_1px_var(--promo-ring-active)]'

function BannerImage({ slide }: { slide: ShopHeroSlide }) {
  return (
    <img
      src={slide.image}
      alt={slide.imageAlt}
      className="h-full w-full object-cover"
      draggable={false}
    />
  )
}

export function ProductPromoCard({
  slide,
  isActive = false,
  className,
}: ProductPromoCardProps) {
  const classNames = cn(
    bannerShellClasses,
    isActive && activeClasses,
    slide.href && interactiveClasses,
    className,
  )

  if (!slide.href) {
    return (
      <article className={classNames}>
        <BannerImage slide={slide} />
      </article>
    )
  }

  if (isExternalHref(slide.href)) {
    return (
      <a
        href={slide.href}
        target="_blank"
        rel="noopener noreferrer"
        className={classNames}
        aria-label={slide.imageAlt}
      >
        <BannerImage slide={slide} />
      </a>
    )
  }

  return (
    <Link to={slide.href} className={classNames} aria-label={slide.imageAlt}>
      <BannerImage slide={slide} />
    </Link>
  )
}
