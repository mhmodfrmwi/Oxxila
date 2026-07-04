// src/components/shop/ShopHeroCarousel.tsx
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PromoCarousel } from '../carousel/PromoCarousel'
import { useShopBanners } from '../../hooks/useShopBanners'
import { ProductPromoCard } from './ProductPromoCard'

function BannerSkeleton() {
  return (
    <div
      className="mx-auto h-[min(360px,78vw)] w-[min(900px,96vw)] animate-pulse rounded-card bg-surface-muted min-[640px]:h-[min(400px,68vw)] min-[640px]:w-[min(900px,96vw)] min-[769px]:h-[396px] min-[769px]:w-[828px] min-[1536px]:h-[430px] min-[1536px]:w-[900px]"
      aria-hidden
    />
  )
}

export function ShopHeroCarousel() {
  const { t } = useTranslation()
  const { slides: rawSlides, loading, error } = useShopBanners()

  const slides = useMemo(
    () =>
      rawSlides.map((slide) => ({
        ...slide,
        brand: slide.brand === 'OXXILA' ? t('shop.banner.brand') : slide.brand,
        headline:
          slide.headline === 'Special Offer' ? t('shop.banner.specialOffer') : slide.headline,
        ctaLabel: t('shop.banner.shopNow'),
        badge: slide.badge === 'FEATURED' ? t('shop.banner.featured') : slide.badge,
        productImageAlt:
          slide.productImageAlt === 'Special Offer'
            ? t('shop.banner.specialOffer')
            : slide.productImageAlt,
      })),
    [rawSlides, t],
  )

  const displayError = error ? t('shop.banner.loadError') : null

  return (
    <section className="relative overflow-visible bg-background pb-3 pt-4 sm:pb-4 sm:pt-5 lg:pb-5 lg:pt-6">
      <div className="container-content">
        {loading ? (
          <BannerSkeleton />
        ) : displayError ? (
          <p className="py-8 text-center text-sm text-support-error" role="alert">
            {displayError}
          </p>
        ) : slides.length === 0 ? (
          <p className="py-8 text-center text-sm text-secondary-text" role="status">
            {t('shop.banner.empty')}
          </p>
        ) : (
          <PromoCarousel
            items={slides}
            getItemKey={(slide) => slide.id}
            ariaLabel={t('shop.banner.ariaLabel')}
            renderSlide={(slide, { isActive, onSelect }) => (
              <ProductPromoCard slide={slide} isActive={isActive} onSelect={onSelect} />
            )}
          />
        )}
      </div>
    </section>
  )
}
