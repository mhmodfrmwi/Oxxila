// src/components/shop/moreReasonsData.ts
import promoNewArrivals from '../../assets/Rectangle 4347.png'
import promoTrending from '../../assets/Rectangle 4347(1).png'
import promoBestSellers from '../../assets/Rectangle 4347(2).png'
import promoOffers from '../../assets/Rectangle 4347(3).png'
import promoDermatologist from '../../assets/Rectangle 4347(4).png'
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
  /** Large-screen grid placement */
  gridClassName: string
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
    image: promoTrending,
    imageAlt: 'Best selling skincare products',
    href: getCollectionHref('best-sellers'),
    layout: 'compact',
    gridClassName: 'lg:col-start-1 lg:row-start-2',
  },
  {
    id: 'top-rated',
    title: 'Top Rated',
    subtitle: 'stay in trend',
    image: promoBestSellers,
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
    gridClassName: 'lg:col-start-3 lg:row-start-2',
  },
]
