// src/components/landing/HeroSection.tsx
import { motion } from 'framer-motion'
import { ArrowUpRight, Shield } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import { SHOP_PATH } from '../../config/routes'
import { cn } from '../../lib/cn'
import {
  HERO_BLOB_PATH,
  HERO_LEFT_BLOB_PATH,
  HERO_RIGHT_BLOB_PATH,
  heroBrushDark,
  heroCollageImage,
  heroImage,
  heroLeftProduct,
  heroRightProduct,
} from './landingData'
import { typeSmallClasses } from '../ui/typography'

const HERO_WIDTH = 1440
const HERO_HEIGHT = 796

const heroFabClass = cn(
  'flex items-center justify-center rounded-full',
  'bg-button-primary text-on-emphasis',
  'shadow-lg shadow-button-primary/35',
)

/** Desktop FAB: anchored at Figma coordinates, but sized in fixed steps so it never balloons on wide screens. */
function HeroFab({ x, y, delay, children }: { x: number; y: number; delay: number; children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute z-40" style={centerStyle(x, y)} aria-hidden>
      <motion.span
        className={cn(heroFabClass, 'size-12 xl:size-14')}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.5 + delay }}
      >
        {children}
      </motion.span>
    </div>
  )
}

/** Opaque product area of the 500×500 collage; its top third is empty sky meant to sit under the desktop title. */
const COLLAGE_CROP = { x: 78, y: 150, width: 374, height: 330 }
/** Figma side blobs (x 80 / 1093, y 395, 267×291), cropped out of the desktop canvas. */
const BLOB = { y: 395, width: 267, height: 291 }
/** `badge` is the FAB centre from Figma; each blob has a notch cut around it. */
const SIDE_BLOBS = {
  left: { x: 80, path: HERO_LEFT_BLOB_PATH, image: heroLeftProduct, badge: { x: 115, y: 650.1 } },
  right: { x: 1093, path: HERO_RIGHT_BLOB_PATH, image: heroRightProduct, badge: { x: 1325, y: 430.1 } },
} as const

/**
 * Below md the blobs sit in their own two-column row under the collage; from md they flank it
 * in a three-column row, bottoms aligned like the desktop composition but without overlapping.
 */
function HeroSideProduct({ side, children }: { side: keyof typeof SIDE_BLOBS; children: ReactNode }) {
  const { x, path, image, badge } = SIDE_BLOBS[side]
  const clipId = `hero-${side}-blob-stacked`

  return (
    <motion.div
      className={cn('relative', side === 'left' && 'md:-order-1')}
      initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.35 }}
    >
      <svg viewBox={`${x} ${BLOB.y} ${BLOB.width} ${BLOB.height}`} className="block h-auto w-full" aria-hidden>
        <defs>
          <clipPath id={clipId}>
            <path d={path} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <image
            href={image}
            x={x}
            y={BLOB.y}
            width={BLOB.width}
            height={BLOB.height}
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      </svg>
      <span
        className={cn(heroFabClass, 'absolute z-20 size-9 -translate-x-1/2 -translate-y-1/2 md:size-10')}
        style={{
          left: `${((badge.x - x) / BLOB.width) * 100}%`,
          top: `${((badge.y - BLOB.y) / BLOB.height) * 100}%`,
        }}
        aria-hidden
      >
        {children}
      </span>
    </motion.div>
  )
}

function pctX(value: number) {
  return `${(value / HERO_WIDTH) * 100}%`
}

function pctY(value: number) {
  return `${(value / HERO_HEIGHT) * 100}%`
}

function centerStyle(x: number, y: number) {
  return {
    left: pctX(x),
    top: pctY(y),
    transform: 'translate(-50%, -50%)',
  }
}

const heroCtaClass = cn(
  'font-hero flex h-[60px] w-[240px] items-center justify-center rounded-full text-base font-normal leading-none',
  'xl:h-[70px] xl:w-[280px] xl:text-lg',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
)

const ctaPrimaryClass = [
  'inline-flex min-h-11 w-full items-center justify-center rounded-full px-6',
  typeSmallClasses,
  'bg-button-primary text-on-emphasis transition-[transform,box-shadow] duration-200',
  'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-button-primary/35',
  'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button-primary focus-visible:ring-offset-2',
  'min-[481px]:w-auto min-[481px]:min-w-[200px]',
].join(' ')

const ctaSecondaryClass = [
  'inline-flex min-h-11 w-full items-center justify-center rounded-full border px-6',
  typeSmallClasses,
  'border-button-primary bg-background text-button-primary transition-colors',
  'hover:bg-card',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button-primary focus-visible:ring-offset-2',
  'min-[481px]:w-auto min-[481px]:min-w-[200px]',
].join(' ')

export function HeroSection() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Desktop composition already carries Figma's 80px top inset; bottom 40px keeps the logo band's spacing.
  return (
    <section className="relative overflow-hidden bg-background pt-3 pb-6 sm:pt-4 sm:pb-8 lg:pt-0 lg:pb-10">
      <div className="w-full">
        {/* Below md: text, images, then CTAs. From md the CTAs move back above the images. */}
        <div className="flex w-full flex-col gap-6 px-4 pt-4 sm:gap-8 sm:pt-6 md:px-[var(--page-gutter)] min-[1025px]:hidden">
          <motion.div
            className="mx-auto max-w-[34rem] text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h1 className="font-hero text-[1.75rem] font-normal leading-[1.2] text-primary-text min-[400px]:text-[2rem] sm:text-[2.5rem] md:text-[2.75rem]">
              {t('home.hero.title')}
            </h1>
            <p className="font-hero mx-auto mt-3 max-w-md text-sm font-normal leading-relaxed text-secondary-text sm:mt-4 sm:text-base">
              {t('home.hero.subtitle')}
            </p>
          </motion.div>

          <motion.div
            className="mx-auto flex w-full max-w-md flex-col gap-3 min-[481px]:max-w-none min-[481px]:flex-row min-[481px]:justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
          >
            <Link to={SHOP_PATH} className={ctaPrimaryClass}>
              {t('home.hero.startShopping')}
            </Link>
            <a href="#contact" className={ctaSecondaryClass}>
              {t('home.hero.contactUs')}
            </a>
          </motion.div>

          <div
            dir="ltr"
            className="relative mx-auto w-full max-w-[28rem] md:grid md:max-w-[52rem] md:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)_minmax(0,1fr)] md:items-end md:gap-x-6"
          >
            <motion.svg
              viewBox={`${COLLAGE_CROP.x} ${COLLAGE_CROP.y} ${COLLAGE_CROP.width} ${COLLAGE_CROP.height}`}
              className="pointer-events-none relative z-10 mx-auto block h-auto w-[88%] md:w-full"
              role="img"
              aria-label={t('home.hero.productsAlt')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.25 }}
            >
              <image href={heroCollageImage} width="500" height="500" />
            </motion.svg>

            {/* 8% gap leaves each card ~46% of the row; md:contents makes the cards columns of the parent grid. */}
            <div className="mt-4 grid grid-cols-2 gap-x-[8%] sm:mt-5 md:contents">
              <HeroSideProduct side="left">
                <ArrowUpRight className="size-4" strokeWidth={2.25} aria-hidden />
              </HeroSideProduct>
              <HeroSideProduct side="right">
                <Shield className="size-4" strokeWidth={2.25} aria-hidden />
              </HeroSideProduct>
            </div>
          </div>
        </div>

        {/* Fixed composition — keep LTR geometry so decorative layout is unchanged in Arabic */}
        <div
          dir="ltr"
          className="relative mx-auto hidden aspect-[1440/796] w-full min-[1025px]:block"
        >
          <svg
            viewBox={`0 0 ${HERO_WIDTH} ${HERO_HEIGHT}`}
            className="absolute inset-0 z-0 h-full w-full"
            aria-hidden
          >
            <defs>
              <clipPath id="hero-main-blob">
                <path d={HERO_BLOB_PATH} />
              </clipPath>
              <clipPath id="hero-right-blob">
                <path d={HERO_RIGHT_BLOB_PATH} />
              </clipPath>
              <clipPath id="hero-left-blob">
                <path d={HERO_LEFT_BLOB_PATH} />
              </clipPath>
              <linearGradient
                id="hero-blob-overlay"
                x1="710"
                y1="686"
                x2="710"
                y2="30"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="var(--surface-muted)" stopOpacity="0" />
                <stop offset="1" stopColor="var(--background)" />
              </linearGradient>
            </defs>

            {isDark ? (
              <image
                href={heroBrushDark}
                x="80"
                y="30"
                width="1280"
                height="656"
                preserveAspectRatio="xMidYMid slice"
              />
            ) : (
              <>
                <g clipPath="url(#hero-main-blob)">
                  <image
                    href={heroImage}
                    x="0"
                    y="0"
                    width={HERO_WIDTH}
                    height={HERO_HEIGHT}
                    preserveAspectRatio="xMidYMid slice"
                  />
                </g>
                <path d={HERO_BLOB_PATH} fill="url(#hero-blob-overlay)" />
              </>
            )}

            <g clipPath="url(#hero-right-blob)">
              <image
                href={heroRightProduct}
                x="1093"
                y="395"
                width="267"
                height="291"
                preserveAspectRatio="xMidYMid slice"
              />
            </g>

            <g clipPath="url(#hero-left-blob)">
              <image
                href={heroLeftProduct}
                x="80"
                y="395"
                width="267"
                height="291"
                preserveAspectRatio="xMidYMid slice"
              />
            </g>
          </svg>

          {/* Figma Hero 4 (110:4575): title y=80 / 52px, subtitle y=224 / 16px, collage y=21 */}
          <div
            className="pointer-events-none absolute z-10 text-center"
            style={{
              left: pctX(276),
              top: pctY(80),
              width: pctX(888),
            }}
          >
            <motion.h1
              className="font-hero text-[length:min(4vw,64px)] font-normal leading-[1.2] text-primary-text"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              {t('home.hero.titleLine1')}
              <br />
              {t('home.hero.titleLine2')}
            </motion.h1>
          </div>

          <div
            className="pointer-events-none absolute z-10 text-center"
            style={{
              left: pctX(380),
              top: pctY(224),
              width: pctX(680),
            }}
          >
            <motion.p
              className="font-hero text-[length:min(1.25vw,20px)] font-normal leading-[1.2] tracking-normal text-secondary-text"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            >
              {t('home.hero.subtitleDesktop')}
            </motion.p>
          </div>

          <motion.svg
            viewBox={`0 0 ${HERO_WIDTH} ${HERO_HEIGHT}`}
            className="pointer-events-none absolute inset-0 z-20 h-full w-full"
            aria-hidden
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          >
            <image
              href={heroCollageImage}
              x="288"
              y="0"
              width="898"
              height="699"
              preserveAspectRatio="xMidYMid meet"
            />
          </motion.svg>

          <HeroFab x={115} y={650.1} delay={0}>
            <ArrowUpRight className="size-5 xl:size-6" strokeWidth={2.25} aria-hidden />
          </HeroFab>

          <HeroFab x={1325} y={430.1} delay={0.15}>
            <Shield className="size-5 xl:size-6" strokeWidth={2.25} aria-hidden />
          </HeroFab>

          {/* Buttons keep fixed sizes instead of scaling with the composition. */}
          <motion.div
            className="absolute inset-x-0 bottom-0 z-40 flex justify-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.35 }}
          >
            <Link
              to={SHOP_PATH}
              className={cn(heroCtaClass, 'bg-button-primary text-on-emphasis transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-button-primary/35 motion-reduce:transition-none motion-reduce:hover:translate-y-0')}
            >
              {t('home.hero.startShopping')}
            </Link>

            <a
              href="#contact"
              className={cn(heroCtaClass, 'border border-button-primary bg-background text-button-primary transition-colors hover:bg-card')}
            >
              {t('home.hero.contactUs')}
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
