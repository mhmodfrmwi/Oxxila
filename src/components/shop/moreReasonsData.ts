// src/components/shop/moreReasonsData.ts
import promoNewArrivals from '../../assets/shop/more-reasons/new-arrivals.png'
import promoBestSellers from '../../assets/shop/more-reasons/best-sellers.png'
import promoTopRated from '../../assets/shop/more-reasons/top-rated.png'
import promoOffers from '../../assets/shop/more-reasons/offers-discounts.png'
import promoDermatologist from '../../assets/shop/more-reasons/dermatologist.png'
import { getCollectionHref } from '../../config/collections'

export type PromotionLayout = 'compact' | 'tall' | 'wide'

export interface ShopPromotion {
  id: string
  title: string
  subtitle: string
  image: string
  imageAlt: string
  href: string
  layout: PromotionLayout
  badge?: string
  /** Large-screen grid placement — Figma Frame 42 (269:8557) */
  gridClassName: string
  /**
   * Figma image fills that crop taller source art into a short frame.
   * Applied as absolute img classes inside the image slot.
   */
  imageCropClassName?: string
}

export const shopPromotions: ShopPromotion[] = [
  {
    id: 'new-arrivals',
    title: 'New Arrivals',
    subtitle: 'Fresh takes you almost need',
    image: promoNewArrivals,
    imageAlt: 'New skincare arrivals',
    href: getCollectionHref('new-arrivals'),
    layout: 'compact',
    gridClassName: 'lg:col-start-1 lg:row-start-1',
  },
  {
    id: 'best-sellers',
    title: 'Best Sellers',
    subtitle: 'Fill your cart',
    image: promoBestSellers,
    imageAlt: 'Best selling skincare products',
    href: getCollectionHref('best-sellers'),
    layout: 'compact',
    gridClassName: 'lg:col-start-1 lg:row-start-2',
  },
  {
    id: 'top-rated',
    title: 'Top Rated',
    subtitle: 'stay in trend',
    image: promoTopRated,
    imageAlt: 'Top rated skincare collection',
    href: getCollectionHref('trending'),
    layout: 'tall',
    gridClassName: 'lg:col-start-2 lg:row-start-1 lg:row-span-2',
  },
  {
    id: 'offers-discounts',
    title: 'Offers & Discounts',
    subtitle: 'discover Oxxila deals',
    image: promoOffers,
    imageAlt: 'Special offers and discounts',
    href: getCollectionHref('offers'),
    layout: 'wide',
    // Figma 269:8577 — tall source cropped into the wide frame
    imageCropClassName: 'absolute left-0 top-[-78.07%] h-[331.65%] w-full max-w-none',
    gridClassName: 'lg:col-start-3 lg:row-start-1',
  },
  {
    id: 'dermatologist',
    title: 'Dermatologist recommended',
    subtitle: 'Doctor Recommended Skincare',
    image: promoDermatologist,
    imageAlt: 'Dermatologist recommended skincare',
    href: getCollectionHref('featured'),
    layout: 'wide',
    // Figma 269:8562 — tall source cropped into the wide frame
    imageCropClassName: 'absolute left-0 top-[-182.58%] h-[331.65%] w-full max-w-none',
    gridClassName: 'lg:col-start-3 lg:row-start-2',
  },
]
