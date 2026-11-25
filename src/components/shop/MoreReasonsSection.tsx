// src/components/shop/MoreReasonsSection.tsx
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { ContentSection } from '../layout/ContentSection'
import { SectionHeader } from '../landing/SectionHeader'
import { shopPromotions, type ShopPromotion } from './moreReasonsData'
import { PromotionCard } from './PromotionCard'

/** Mirror of the LTR bento: wide cards in column 1 (the right edge in RTL), compact ones last. */
function rtlGridClassName(promotion: ShopPromotion) {
  const row = promotion.gridClassName.match(/lg:row-start-\d/)?.[0] ?? 'lg:row-start-1'
  if (promotion.layout === 'wide') return `lg:col-start-1 ${row}`
  if (promotion.layout === 'tall') return 'lg:col-start-2 lg:row-start-1 lg:row-span-2'
  return `lg:col-start-3 ${row}`
}

const DESKTOP_GRID = '(min-width: 1024px)'

export function MoreReasonsSection() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.dir() === 'rtl'
  const isDesktop = useMediaQuery(DESKTOP_GRID)

  const promotions = useMemo(
    () =>
      shopPromotions.map((promotion) => ({
        ...promotion,
        title: t(`shop.reasons.items.${promotion.id}.title`),
        subtitle: t(`shop.reasons.items.${promotion.id}.subtitle`),
        imageAlt: t(`shop.reasons.items.${promotion.id}.imageAlt`),
      })),
    [t],
  )

  return (
    <ContentSection
      aria-labelledby="more-reasons-heading"
      padding="compact"
      className="lg:py-6"
    >
      <SectionHeader
        id="more-reasons-heading"
        title={t('shop.reasons.title')}
        size="compact"
      />

      {isDesktop ? (
        <div
          className={[
            'grid w-full gap-4',
            // Arabic starts reading from the right, so the two wide cards lead there.
            isRtl
              ? 'grid-cols-[minmax(0,4fr)_minmax(0,2fr)_minmax(0,2fr)]'
              : 'grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,4fr)]',
            'grid-rows-2',
            'h-[min(535px,42vw)] min-h-[420px]',
          ].join(' ')}
        >
          {promotions.map((promotion) => (
            <PromotionCard
              key={promotion.id}
              promotion={promotion}
              presentation="grid"
              className={isRtl ? rtlGridClassName(promotion) : promotion.gridClassName}
            />
          ))}
        </div>
      ) : (
        <div
          role="region"
          aria-label={t('shop.reasons.title')}
          className={[
            'flex flex-row flex-nowrap gap-3 overflow-x-auto overscroll-x-contain',
            'snap-x snap-mandatory',
            '[-webkit-overflow-scrolling:touch]',
            '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            // Bleed past ContentSection gutter, then pad 16px with matching scroll-padding
            '-mx-[var(--page-gutter)] px-4 [scroll-padding-inline:1rem]',
          ].join(' ')}
        >
          {promotions.map((promotion) => (
            <PromotionCard
              key={promotion.id}
              promotion={promotion}
              presentation="carousel"
            />
          ))}
        </div>
      )}
    </ContentSection>
  )
}
