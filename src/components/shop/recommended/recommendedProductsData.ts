import product1 from '../../../assets/landing/sections/cta-image0_110_5881.png'
import product2 from '../../../assets/landing/sections/cta-image1_110_5881.png'
import product3 from '../../../assets/landing/sections/cta-image2_110_5881.jpg'
import product4 from '../../../assets/landing/sections/cta-image3_110_5881.jpg'
import product5 from '../../../assets/landing/sections/cta-image4_110_5881.png'
import product6 from '../../../assets/landing/image2_47_362.png'

export interface RecommendedProduct {
  id: string
  brand: string
  title: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  image: string
  imageAlt: string
  badge?: string
  href: string
}

export const recommendedProducts: RecommendedProduct[] = [
  {
    id: 'rec-garnier-micellar',
    brand: 'garnier',
    title: 'Micellar Water Face Cleanser & Daily Makeup Remover',
    price: 299,
    originalPrice: 350,
    rating: 4.3,
    reviewCount: 215,
    image: product1,
    imageAlt: 'Garnier Micellar Water Face Cleanser',
    badge: 'Best seller',
    href: '/shop?product=garnier-micellar',
  },
  {
    id: 'rec-equate-pain',
    brand: 'equate',
    title: 'Pain Reliever Extra Strength 2 Pack',
    price: 899,
    originalPrice: 1099,
    rating: 4.5,
    reviewCount: 432,
    image: product2,
    imageAlt: 'Equate Pain Reliever',
    badge: 'Best seller',
    href: '/shop?product=equate-pain',
  },
  {
    id: 'rec-tukol-cough',
    brand: 'Tukol',
    title: 'Maximum Strength Cough & Cold Relief Syrup',
    price: 1299,
    originalPrice: 1499,
    rating: 4.2,
    reviewCount: 178,
    image: product3,
    imageAlt: 'Tukol Cough Syrup',
    badge: 'Best seller',
    href: '/shop?product=tukol-cough',
  },
  {
    id: 'rec-equate-alcohol',
    brand: 'equate',
    title: 'Isopropyl Alcohol Antiseptic 91%',
    price: 499,
    originalPrice: 599,
    rating: 4.6,
    reviewCount: 892,
    image: product4,
    imageAlt: 'Equate Isopropyl Alcohol',
    badge: 'Best seller',
    href: '/shop?product=equate-alcohol',
  },
  {
    id: 'rec-pro-glucose',
    brand: 'Pro Glucose',
    title: 'Blood Health Daily Supplement',
    price: 2499,
    originalPrice: 2999,
    rating: 4.4,
    reviewCount: 326,
    image: product5,
    imageAlt: 'Pro Glucose Blood Health Supplement',
    badge: 'Best seller',
    href: '/shop?product=pro-glucose',
  },
  {
    id: 'rec-pain-spray',
    brand: 'equate',
    title: 'Pain Relief Spray Fast Acting Formula',
    price: 799,
    originalPrice: 999,
    rating: 4.1,
    reviewCount: 154,
    image: product6,
    imageAlt: 'Pain Relief Spray',
    badge: 'Best seller',
    href: '/shop?product=pain-spray',
  },
]
