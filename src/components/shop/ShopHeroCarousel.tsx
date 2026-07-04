// src/components/shop/ShopHeroCarousel.tsx
import { PromoCarousel } from '../carousel/PromoCarousel'
import { useShopBanners } from '../../hooks/useShopBanners'
import { ProductPromoCard } from './ProductPromoCard'

function BannerSkeleton() {
  return (
    <div
      className="mx-auto h-[min(360px,78vw)] w-[min(900px,96vw)] animate-pulse rounded-card bg-surface-muted min-[640px]:h-[min(400px,68vw)] min-[769px]:h-[430px]"
      aria-hidden
    />
  )
}

export function ShopHeroCarousel() {
  const { slides, loading, error } = useShopBanners()

  return (
    <section className="relative overflow-visible bg-background pb-3 pt-4 sm:pb-4 sm:pt-5 lg:pb-5 lg:pt-6">
      <div className="container-content">
        {loading ? (
          <BannerSkeleton />
        ) : error ? (
          <p className="py-8 text-center text-sm text-support-error" role="alert">
            {error}
          </p>
        ) : slides.length === 0 ? (
          <p className="py-8 text-center text-sm text-secondary-text" role="status">
            No promotions available right now.
          </p>
        ) : (
          <PromoCarousel
            items={slides}
            getItemKey={(slide) => slide.id}
            ariaLabel="Shop promotions"
            renderSlide={(slide, { isActive, onSelect }) => (
              <ProductPromoCard slide={slide} isActive={isActive} onSelect={onSelect} />
            )}
          />
        )}
      </div>
    </section>
  )
}
