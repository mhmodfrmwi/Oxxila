import promoBestSellers from '../../assets/landing/sections/cta-image0_110_5881.png'
import promoNewArrivals from '../../assets/landing/sections/cta-image1_110_5881.png'
import promoTopRated from '../../assets/landing/sections/cta-image2_110_5881.jpg'
import promoOffers from '../../assets/landing/sections/cta-image3_110_5881.jpg'
import promoDermatologist from '../../assets/landing/sections/cta-image4_110_5881.png'

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
    href: '/shop?filter=new-arrivals',
    layout: 'compact',
    gridClassName: 'lg:col-start-1 lg:row-start-1',
  },
  {
    id: 'best-sellers',
    title: 'Best Sellers',
    subtitle: 'Fill your cart',
    image: promoBestSellers,
    imageAlt: 'Best selling skincare products',
    href: '/shop?filter=best-sellers',
    layout: 'compact',
    gridClassName: 'lg:col-start-1 lg:row-start-2',
  },
  {
    id: 'top-rated',
    title: 'Top Rated',
    subtitle: 'stay in trend',
    image: promoTopRated,
    imageAlt: 'Top rated skincare collection',
    href: '/shop?filter=top-rated',
    layout: 'tall',
    gridClassName: 'lg:col-start-2 lg:row-start-1 lg:row-span-2',
  },
  {
    id: 'offers-discounts',
    title: 'Offers & Discounts',
    subtitle: 'discover Oxxila deals',
    image: promoOffers,
    imageAlt: 'Special offers and discounts',
    href: '/shop?filter=offers',
    layout: 'wide',
    gridClassName: 'lg:col-start-3 lg:row-start-1',
  },
  {
    id: 'dermatologist',
    title: 'Dermatologist recommended',
    subtitle: 'Doctor Recommended Skincare',
    image: promoDermatologist,
    imageAlt: 'Dermatologist recommended skincare',
    href: '/shop?filter=dermatologist',
    layout: 'wide',
    gridClassName: 'lg:col-start-3 lg:row-start-2',
  },
]
