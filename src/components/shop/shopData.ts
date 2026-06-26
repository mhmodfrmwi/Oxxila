import ctaProduct1 from '../../assets/landing/sections/cta-image0_110_5881.png'
import ctaProduct2 from '../../assets/landing/sections/cta-image1_110_5881.png'
import ctaProduct3 from '../../assets/landing/sections/cta-image2_110_5881.jpg'
import ctaProduct4 from '../../assets/landing/sections/cta-image3_110_5881.jpg'
import ctaProduct5 from '../../assets/landing/sections/cta-image4_110_5881.png'
import concernAcne from '../../assets/landing/image0_47_362.png'
import concernPigmentation from '../../assets/landing/image1_47_362.jpg'
import concernSensitive from '../../assets/landing/image2_47_362.png'
import concernDrought from '../../assets/landing/image3_47_362.png'
import concernWrinkles from '../../assets/landing/image4_47_362.png'
import concernFineLines from '../../assets/landing/image5_47_362.png'

export type ShopHeroSlideVariant = 'dark' | 'light'

export interface ShopHeroSlide {
  id: string
  variant: ShopHeroSlideVariant
  brand: string
  brandSubline?: string
  headline: string
  ctaLabel: string
  ctaHref: string
  productImage: string
  productImageAlt: string
  badge?: string
  badgeParts?: { prefix: string; title: string; suffix: string }
  statHighlight?: string
  statBody?: string
  disclaimer?: string
}

export interface ShopCategory {
  id: string
  name: string
  image: string
  href: string
}

export const shopHeroSlides: ShopHeroSlide[] = [
  {
    id: 'lrp-mela',
    variant: 'dark',
    brand: 'LA ROCHE-POSAY',
    brandSubline: 'LABORATOIRE DERMATOLOGIQUE',
    headline: 'Up To 60% OFF',
    ctaLabel: 'SHOP NOW',
    ctaHref: '/shop?brand=la-roche-posay',
    productImage: ctaProduct2,
    productImageAlt: 'La Roche-Posay Mela B3 Serum',
    badgeParts: { prefix: 'NEW', title: 'MELA B3', suffix: 'SERUM' },
    statHighlight: '85%',
    statBody: 'SHOWED REDUCTION IN THE LOOK OF PERSISTENT DARK SPOTS*',
    disclaimer:
      '*After 8 weeks of use, 85% of subjects showed improvement in at least one of the dark spot size or contrast as assessed by expert grading.',
  },
  {
    id: 'pro-studio',
    variant: 'light',
    brand: 'PRO STUDIO',
    headline: 'Up To 50% OFF',
    ctaLabel: 'SHOP NOW',
    ctaHref: '/shop?brand=pro-studio',
    productImage: ctaProduct1,
    productImageAlt: 'Pro Studio skincare set',
    badge: 'NEW COLLECTION',
    statHighlight: '72%',
    statBody: 'REPORTED SMOOTHER-LOOKING SKIN IN 4 WEEKS*',
    disclaimer: '*Based on user perception study.',
  },
  {
    id: 'sugar-beauty',
    variant: 'light',
    brand: 'SUGAR',
    headline: 'Glow Event',
    ctaLabel: 'SHOP NOW',
    ctaHref: '/shop?brand=sugar',
    productImage: ctaProduct3,
    productImageAlt: 'Sugar beauty product',
    badge: 'BEST SELLER',
    statHighlight: '40%',
    statBody: 'OFF SELECTED BUNDLES THIS WEEK ONLY*',
    disclaimer: '*While supplies last.',
  },
  {
    id: 'night-repair',
    variant: 'light',
    brand: 'OXXILA',
    headline: 'Night Repair Sale',
    ctaLabel: 'SHOP NOW',
    ctaHref: '/shop?filter=night',
    productImage: ctaProduct4,
    productImageAlt: 'Night repair cream',
    badge: 'DERMATOLOGIST APPROVED',
    statHighlight: '3X',
    statBody: 'MORE RADIANCE WITH NIGHTLY USE*',
    disclaimer: '*Compared to baseline hydration.',
  },
  {
    id: 'barrier',
    variant: 'light',
    brand: 'OXXILA',
    headline: 'Barrier Care Event',
    ctaLabel: 'SHOP NOW',
    ctaHref: '/shop?filter=barrier',
    productImage: ctaProduct5,
    productImageAlt: 'Moisture barrier cream',
    badge: 'LIMITED TIME',
    statHighlight: '60%',
    statBody: 'OFF MULTI-STEP KITS FOR SENSITIVE SKIN*',
    disclaimer: '*Terms apply.',
  },
]

export const shopCategories: ShopCategory[] = [
  { id: 'skin-care', name: 'Skin Care', image: concernSensitive, href: '/shop?category=skin-care' },
  { id: 'hair-care', name: 'Hair Care', image: ctaProduct4, href: '/shop?category=hair-care' },
  { id: 'body-care', name: 'Body Care', image: concernDrought, href: '/shop?category=body-care' },
  { id: 'face-treatments', name: 'Face Treatments', image: ctaProduct3, href: '/shop?category=face-treatments' },
  { id: 'sun-protection', name: 'Sun Protection', image: ctaProduct1, href: '/shop?category=sun-protection' },
  { id: 'anti-aging', name: 'Anti-Aging', image: concernWrinkles, href: '/shop?category=anti-aging' },
  { id: 'acne', name: 'Acne Solutions', image: concernAcne, href: '/shop?category=acne' },
  {
    id: 'pigmentation',
    name: 'Pigmentation & Brightening',
    image: concernPigmentation,
    href: '/shop?category=pigmentation',
  },
  { id: 'sensitive', name: 'Sensitive Skin', image: concernSensitive, href: '/shop?category=sensitive' },
  { id: 'mens', name: "Men's Care", image: concernFineLines, href: '/shop?category=mens' },
  { id: 'womens', name: "Women's Care", image: ctaProduct2, href: '/shop?category=womens' },
]
