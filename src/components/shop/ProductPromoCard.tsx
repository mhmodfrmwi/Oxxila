import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { typeSmallClasses } from '../ui/typography'
import type { ShopHeroSlide } from './shopData'

interface ProductPromoCardProps {
  slide: ShopHeroSlide
  isActive?: boolean
  onSelect?: () => void
  className?: string
}

function ProductSwirlGlow({ variant }: { variant: ShopHeroSlide['variant'] }) {
  const isDarkBanner = variant === 'dark'
  const stroke = isDarkBanner ? 'url(#promo-swirl-gradient)' : 'url(#promo-swirl-gradient-light)'

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 540 430"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="promo-swirl-gradient" x1="0%" y1="20%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#8b7cf8" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#7b65fb" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#0280e0" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="promo-swirl-gradient-light" x1="0%" y1="20%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#8b7cf8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#c0b5de" stopOpacity="0.35" />
          </linearGradient>
          <filter id="promo-swirl-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id="promo-swirl-blur-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        <g filter="url(#promo-swirl-blur)" opacity={isDarkBanner ? 0.85 : 0.55}>
          <path
            d="M40 280 C120 120, 200 80, 280 200 S420 340, 500 180"
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M80 320 C160 180, 240 140, 310 260 S400 360, 480 220"
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M120 160 C200 60, 280 100, 340 220 S420 300, 460 140"
            stroke={stroke}
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.6"
          />
        </g>

        <ellipse
          cx="210"
          cy="215"
          rx="120"
          ry="150"
          fill="var(--promo-accent-glow)"
          filter="url(#promo-swirl-blur-soft)"
          opacity={isDarkBanner ? 0.9 : 0.65}
        />
      </svg>

      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_38%_50%,var(--promo-accent-glow)_0%,transparent_62%)]"
        aria-hidden
      />
    </div>
  )
}

function BrandMark({
  brand,
  subline,
  variant,
}: {
  brand: string
  subline?: string
  variant: ShopHeroSlide['variant']
}) {
  const isDarkBanner = variant === 'dark'
  const isLrp = brand.toUpperCase().includes('LA ROCHE')

  return (
    <div
      className={cn(
        'w-full max-w-[168px] px-2.5 py-2',
        'sm:max-w-[200px] sm:px-3.5 sm:py-2.5',
        'min-[769px]:max-w-[252px] min-[769px]:px-5 min-[769px]:py-3.5',
        isDarkBanner ? 'promo-banner__brand--on-dark' : 'promo-banner__brand--on-light',
      )}
    >
      {isLrp ? (
        <div className="relative text-left">
          <span
            className="absolute top-0 right-[28%] h-2 w-2 bg-[#0043ce] sm:h-2.5 sm:w-2.5"
            aria-hidden
          />
          <p
            className={cn(
              'pr-6 font-medium uppercase leading-[1.05] tracking-[0.06em]',
              'text-[length:calc(var(--font-size-small)*0.72)]',
              'sm:text-[length:calc(var(--font-size-small)*0.88)]',
              'min-[769px]:text-[length:calc(var(--font-size-small)*0.95)]',
            )}
          >
            LA ROCHE-POSAY
          </p>
          {subline && (
            <p
              className={cn(
                'mt-1.5 uppercase leading-tight tracking-[0.14em]',
                isDarkBanner
                  ? 'text-[var(--promo-brand-subline-on-dark)]'
                  : 'text-[var(--promo-text-muted)]',
                'text-[length:calc(var(--font-size-small)*0.48)]',
                'sm:text-[length:calc(var(--font-size-small)*0.55)]',
                'min-[769px]:text-[length:calc(var(--font-size-small)*0.58)]',
              )}
            >
              {subline}
            </p>
          )}
        </div>
      ) : (
        <div className="text-center">
          <p
            className={cn(
              'font-medium uppercase leading-tight tracking-[0.08em]',
              'text-[length:calc(var(--font-size-small)*0.75)]',
              'sm:text-[length:calc(var(--font-size-small)*0.9)]',
              'min-[769px]:text-[length:var(--font-size-small)]',
            )}
          >
            {brand}
          </p>
          {subline && (
            <p
              className={cn(
                'mt-1 uppercase leading-tight tracking-wide text-[var(--promo-text-muted)]',
                'text-[length:calc(var(--font-size-small)*0.5)]',
                'min-[769px]:text-[length:calc(var(--font-size-small)*0.6)]',
              )}
            >
              {subline}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function BadgeLabel({ slide, className }: { slide: ShopHeroSlide; className?: string }) {
  if (slide.badgeParts) {
    return (
      <div className={cn('text-right leading-none', className)}>
        <span
          className={cn(
            'block font-normal uppercase tracking-[0.18em]',
            'text-[length:calc(var(--font-size-small)*0.62)]',
            'min-[769px]:text-[length:calc(var(--font-size-small)*0.72)]',
          )}
        >
          {slide.badgeParts.prefix}
        </span>
        <span
          className={cn(
            'mt-1 block font-semibold uppercase tracking-[0.04em]',
            'text-[length:calc(var(--font-size-small)*0.95)]',
            'min-[769px]:text-[length:calc(var(--font-size-base)*0.95)]',
          )}
        >
          {slide.badgeParts.title}
        </span>
        <span
          className={cn(
            'mt-0.5 block font-normal uppercase tracking-[0.14em]',
            'text-[length:calc(var(--font-size-small)*0.68)]',
            'min-[769px]:text-[length:calc(var(--font-size-small)*0.78)]',
          )}
        >
          {slide.badgeParts.suffix}
        </span>
      </div>
    )
  }

  if (!slide.badge) return null

  return (
    <p className={cn('text-right font-medium uppercase tracking-[0.12em]', typeSmallClasses, className)}>
      {slide.badge}
    </p>
  )
}

export function ProductPromoCard({
  slide,
  isActive = false,
  onSelect,
  className,
}: ProductPromoCardProps) {
  return (
    <article
      data-promo-variant={slide.variant}
      className={cn(
        'promo-banner',
        'h-[min(360px,78vw)] w-[min(900px,96vw)] overflow-hidden rounded-card',
        'min-[640px]:h-[min(400px,68vw)] min-[640px]:w-[min(900px,96vw)]',
        'min-[769px]:h-[430px] min-[769px]:w-[900px]',
        'border border-[color:var(--promo-border)] bg-[color:var(--promo-bg)]',
        'text-[color:var(--promo-text)] shadow-xl transition-shadow duration-500',
        '[box-shadow:0_20px_40px_var(--promo-shadow)]',
        isActive && '[box-shadow:0_20px_40px_var(--promo-shadow),0_0_0_1px_var(--promo-ring-active)]',
        onSelect && 'cursor-pointer',
        className,
      )}
      onClick={onSelect}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect()
              }
            }
          : undefined
      }
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <div className="grid h-full grid-cols-[40%_60%]">
        <div
          className={cn(
            'flex h-full flex-col',
            'justify-center gap-2.5 px-3 py-4',
            'min-[640px]:justify-between min-[640px]:gap-0 min-[640px]:px-7 min-[640px]:py-8',
            'min-[769px]:px-10 min-[769px]:py-9',
          )}
        >
          <div className="flex shrink-0 justify-center min-[769px]:justify-start">
            <BrandMark brand={slide.brand} subline={slide.brandSubline} variant={slide.variant} />
          </div>

          <h2
            className={cn(
              'flex flex-1 items-center text-center font-semibold leading-[1.05] tracking-tight',
              'text-[length:calc(var(--font-size-base)*0.88)]',
              'min-[480px]:text-[length:calc(var(--font-size-base)*1.05)]',
              'min-[640px]:text-[length:calc(var(--font-size-base)*1.35)]',
              'min-[769px]:text-left min-[769px]:text-[length:calc(var(--font-size-base)*2.05)]',
            )}
          >
            {slide.headline}
          </h2>

          <div className="flex shrink-0 justify-center min-[769px]:justify-start">
            <Link
              to={slide.ctaHref}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'promo-banner__cta inline-flex items-center justify-center rounded-full italic transition-all hover:brightness-110',
                'min-h-8 min-w-[96px] px-4 text-[length:calc(var(--font-size-small)*0.9)]',
                'min-[480px]:min-h-9 min-[480px]:min-w-[112px] min-[480px]:px-5',
                'min-[640px]:min-h-10 min-[640px]:min-w-[140px] min-[640px]:px-6',
                'min-[769px]:min-h-11 min-[769px]:min-w-[172px] min-[769px]:px-8',
                typeSmallClasses,
              )}
            >
              {slide.ctaLabel}
            </Link>
          </div>
        </div>

        <div className="relative min-h-0 overflow-hidden">
          <ProductSwirlGlow variant={slide.variant} />

          <img
            src={slide.productImage}
            alt={slide.productImageAlt}
            className={cn(
              'absolute top-1/2 left-[4%] z-10 max-h-[56%] w-auto max-w-[42%] -translate-y-1/2 object-contain',
              'drop-shadow-[0_12px_28px_rgb(0_0_0/0.35)]',
              'min-[480px]:left-[5%] min-[480px]:max-h-[62%] min-[480px]:max-w-[44%]',
              'min-[640px]:left-[6%] min-[640px]:max-h-[70%] min-[640px]:max-w-[46%]',
              'min-[769px]:left-[7%] min-[769px]:max-h-[78%] min-[769px]:max-w-none',
            )}
            draggable={false}
          />

          {(slide.badge || slide.badgeParts) && (
            <div
              className={cn(
                'absolute top-3 right-3 z-20 hidden text-[color:var(--promo-text)] min-[480px]:block',
                'sm:top-5 sm:right-5 min-[769px]:top-8 min-[769px]:right-8',
              )}
            >
              <BadgeLabel slide={slide} className="text-[color:var(--promo-text-muted)]" />
            </div>
          )}

          {(slide.statHighlight || slide.statBody) && (
            <div
              className={cn(
                'absolute top-1/2 right-2.5 z-20 flex max-w-[54%] -translate-y-1/2 items-start',
                'gap-1 min-[480px]:right-4 min-[480px]:max-w-[52%] min-[480px]:gap-1.5',
                'min-[640px]:right-6 min-[640px]:gap-2 min-[769px]:right-8 min-[769px]:max-w-[46%] min-[769px]:gap-3',
              )}
            >
              {slide.statHighlight && (
                <span
                  className={cn(
                    'shrink-0 font-semibold leading-[0.9] tracking-tight',
                    'text-[length:calc(var(--font-size-base)*1.2)]',
                    'min-[480px]:text-[length:calc(var(--font-size-base)*1.6)]',
                    'min-[640px]:text-[length:calc(var(--font-size-base)*2.2)]',
                    'min-[769px]:text-[length:calc(var(--font-size-base)*3.75)]',
                  )}
                >
                  {slide.statHighlight}
                </span>
              )}
              {slide.statBody && (
                <p
                  className={cn(
                    'min-w-0 flex-1 pt-0.5 text-left font-medium uppercase leading-[1.1] tracking-[0.02em]',
                    'text-[length:calc(var(--font-size-small)*0.42)]',
                    'min-[480px]:text-[length:calc(var(--font-size-small)*0.5)]',
                    'min-[640px]:pt-1 min-[640px]:text-[length:calc(var(--font-size-small)*0.68)]',
                    'min-[769px]:pt-2 min-[769px]:text-[length:calc(var(--font-size-small)*0.88)]',
                  )}
                >
                  {slide.statBody}
                </p>
              )}
            </div>
          )}

          {slide.disclaimer && (
            <p
              className={cn(
                'absolute right-2.5 bottom-2.5 left-[30%] z-20 line-clamp-2 text-right leading-[1.3]',
                'text-[color:var(--promo-text-muted)]',
                'hidden min-[640px]:block',
                'min-[640px]:right-6 min-[640px]:bottom-5 min-[769px]:right-8 min-[769px]:bottom-7',
                'text-[length:calc(var(--font-size-small)*0.5)]',
                'min-[769px]:max-w-[58%] min-[769px]:text-[length:calc(var(--font-size-small)*0.68)]',
              )}
            >
              {slide.disclaimer}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
