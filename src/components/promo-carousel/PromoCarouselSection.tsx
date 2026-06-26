import { CountdownPromoCarousel } from './CountdownPromoCarousel'
import { promoCarouselSlides } from './promoCarouselData'
import { ContentSection } from '../layout/ContentSection'

export function PromoCarouselSection() {
  return (
    <ContentSection aria-label="Sale promotions" padding="compact">
      <CountdownPromoCarousel slides={promoCarouselSlides} />
    </ContentSection>
  )
}
