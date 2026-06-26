import { PromoCarousel } from '../carousel/PromoCarousel'
import { ProductPromoCard } from './ProductPromoCard'
import { shopHeroSlides } from './shopData'

export function ShopHeroCarousel() {
  return (
    <section className="relative overflow-visible bg-background pb-3 pt-4 sm:pb-4 sm:pt-5 lg:pb-5 lg:pt-6">
      <div className="container-content">
        <PromoCarousel
          items={shopHeroSlides}
          getItemKey={(slide) => slide.id}
          ariaLabel="Shop promotions"
          renderSlide={(slide, { isActive, onSelect }) => (
            <ProductPromoCard slide={slide} isActive={isActive} onSelect={onSelect} />
          )}
        />
      </div>
    </section>
  )
}
