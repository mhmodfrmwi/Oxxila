// src/components/landing/HeroSection.tsx
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import { SHOP_PATH } from '../../config/routes'
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

const HERO_RIGHT_PIN_PATH =
  'M1325 416.816C1320.99 416.816 1318.39 419.508 1315.31 420.489C1314.06 420.888 1313.44 421.088 1313.18 421.369C1312.93 421.65 1312.86 422.061 1312.71 422.883C1311.12 431.677 1314.59 439.808 1322.85 442.973C1323.74 443.313 1324.19 443.483 1325 443.483C1325.82 443.483 1326.26 443.313 1327.15 442.973C1335.42 439.808 1338.88 431.677 1337.29 422.883C1337.14 422.061 1337.07 421.65 1336.82 421.369C1336.56 421.087 1335.94 420.888 1334.69 420.489C1331.61 419.508 1329.01 416.816 1325 416.816Z'

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
    <section className="relative overflow-hidden bg-background py-8 sm:py-12 lg:py-20">
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
            className="absolute inset-0 h-full w-full"
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

            <image
              href={heroCollageImage}
              x="288"
              y="21.1492"
              width="898"
              height="699"
              preserveAspectRatio="xMidYMid meet"
            />

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

            <circle cx="1325" cy="430.149" r="35" fill="var(--button-primary)" />
            <g
              fill="none"
              stroke="var(--text-on-color)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={HERO_RIGHT_PIN_PATH} />
              <path d="M1325 423.483L1325 426.149" />
            </g>

            <circle cx="115" cy="650.149" r="35" fill="var(--button-primary)" />
            <g
              fill="none"
              stroke="var(--text-on-color)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M122.667 643.483L108 658.149" />
              <path d="M114.667 642.325C114.667 642.325 122.178 641.691 123.318 642.831C124.458 643.971 123.825 651.483 123.825 651.483" />
            </g>
          </svg>

          <div className="pointer-events-none absolute inset-0 z-20">
            <div className="absolute inset-x-0 text-center" style={{ top: pctY(92) }}>
              <h1 className="font-serif text-5xl font-medium leading-[1.15] text-primary-text xl:text-6xl 2xl:text-7xl">
                {t('home.hero.titleLine1')} <br /> {t('home.hero.titleLine2')}
              </h1>
            </div>

            <p
              className="absolute inset-x-0 mx-auto max-w-3xl px-6 text-center font-serif text-lg italic leading-snug text-primary-text/80"
              style={{ top: pctY(228) }}
            >
              {t('home.hero.subtitleDesktop')}
            </p>
          </div>

          <button
            type="button"
            className="absolute z-30 min-h-11 min-w-11 rounded-full"
            style={centerStyle(115, 650.149)}
            aria-label={t('home.hero.previousSlide')}
          />

          <button
            type="button"
            className="absolute z-30 min-h-11 min-w-11 rounded-full"
            style={centerStyle(1325, 430.149)}
            aria-label={t('home.hero.nextSlide')}
          />

          <Link
            to={SHOP_PATH}
            className={[
              'absolute z-30 flex min-h-11 items-center justify-center rounded-full bg-button-primary text-on-emphasis transition-colors hover:bg-button-primary-hover hover:text-primary-text',
              typeSmallClasses,
            ].join(' ')}
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
            className={[
              'absolute z-30 flex min-h-11 items-center justify-center rounded-full border border-button-primary bg-background text-button-primary transition-colors hover:bg-card',
              typeSmallClasses,
            ].join(' ')}
            style={{
              left: pctX(728.5),
              top: pctY(726.5),
              width: pctX(279),
              height: pctY(69),
            }}
          >
            {t('home.hero.contactUs')}
          </a>
        </div>
      </div>
    </section>
  )
}
