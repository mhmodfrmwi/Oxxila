// src/components/landing/HeroSection.tsx
import { ArrowUpRight, Shield } from 'lucide-react'
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
  'hero-fab pointer-events-none absolute z-40 flex aspect-square items-center justify-center rounded-full',
  'bg-button-primary text-on-emphasis',
  'shadow-lg shadow-button-primary/35',
)

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

const ctaPrimaryClass = [
  'inline-flex min-h-11 w-full items-center justify-center rounded-full px-6',
  typeSmallClasses,
  'bg-button-primary text-on-emphasis transition-colors',
  'hover:bg-button-primary-hover hover:text-primary-text',
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

  return (
    <section className="relative overflow-hidden bg-background pt-3 pb-8 sm:pt-4 sm:pb-12 lg:pt-6 lg:pb-16">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-5 min-[1025px]:hidden">
          <div className="relative mx-auto max-w-lg overflow-hidden rounded-3xl bg-surface-muted">
            <img
              src={isDark ? heroBrushDark : heroImage}
              alt=""
              className="aspect-[4/3] w-full object-cover sm:aspect-[16/11]"
              loading="eager"
            />
            <img
              src={heroCollageImage}
              alt={t('home.hero.productsAlt')}
              className="pointer-events-none absolute inset-0 h-full w-full object-contain p-3 sm:p-4"
              loading="eager"
            />
          </div>

          <div className="mx-auto mt-8 max-w-xl text-center">
            <h1 className="my-4 font-serif text-4xl font-medium leading-[1.15] text-primary-text md:text-5xl lg:text-6xl">
              {t('home.hero.title')}
            </h1>
            <p className="mx-auto mt-4 max-w-md font-serif text-sm italic leading-relaxed text-primary-text/80 md:text-base lg:text-lg">
              {t('home.hero.subtitle')}
            </p>
          </div>

          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 min-[481px]:max-w-none min-[481px]:flex-row min-[481px]:justify-center">
            <Link to={SHOP_PATH} className={ctaPrimaryClass}>
              {t('home.hero.startShopping')}
            </Link>
            <a href="#contact" className={ctaSecondaryClass}>
              {t('home.hero.contactUs')}
            </a>
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
            <h1 className="font-serif text-[clamp(2.25rem,4vw,58px)] font-normal leading-[1.2] text-[#5d5a88]">
              {t('home.hero.titleLine1')}
              <br />
              {t('home.hero.titleLine2')}
            </h1>
          </div>

          <div
            className="pointer-events-none absolute z-10 text-center"
            style={{
              left: pctX(380),
              top: pctY(224),
              width: pctX(680),
            }}
          >
            <p className="font-serif text-[clamp(0.875rem,1.25vw,18px)] font-normal leading-[1.2] text-[#9491b8]">
              {t('home.hero.subtitleDesktop')}
            </p>
          </div>

          <svg
            viewBox={`0 0 ${HERO_WIDTH} ${HERO_HEIGHT}`}
            className="pointer-events-none absolute inset-0 z-20 h-full w-full"
            aria-hidden
          >
            <image
              href={heroCollageImage}
              x="288"
              y="0"
              width="898"
              height="699"
              preserveAspectRatio="xMidYMid meet"
            />
          </svg>

          <div
            className={heroFabClass}
            style={{
              ...centerStyle(115, 650.1),
              width: pctX(70),
            }}
            aria-hidden
          >
            <ArrowUpRight size={20} strokeWidth={2.25} aria-hidden className="shrink-0" />
          </div>

          <div
            className={heroFabClass}
            style={{
              ...centerStyle(1325, 430.1),
              width: pctX(70),
            }}
            aria-hidden
          >
            <Shield size={20} strokeWidth={2.25} aria-hidden className="shrink-0" />
          </div>

          <Link
            to={SHOP_PATH}
            className="absolute z-40 flex items-center justify-center rounded-full bg-[#7b65fb] font-serif text-[clamp(0.875rem,1.25vw,18px)] font-normal leading-none text-white transition-colors hover:bg-button-primary-hover hover:text-primary-text"
            style={{
              left: pctX(432),
              top: pctY(726),
              width: pctX(280),
              height: pctY(70),
            }}
          >
            {t('home.hero.startShopping')}
          </Link>

          <a
            href="#contact"
            className="absolute z-40 flex items-center justify-center rounded-full border border-[#7b65fb] bg-[#f5f6ff] font-serif text-[clamp(0.875rem,1.25vw,18px)] font-normal leading-none text-[#7b65fb] transition-colors hover:bg-card"
            style={{
              left: pctX(728),
              top: pctY(726),
              width: pctX(280),
              height: pctY(70),
            }}
          >
            {t('home.hero.contactUs')}
          </a>
        </div>
      </div>
    </section>
  )
}
