// src/components/shop/shopData.ts
import ctaProduct1 from '../../assets/landing/sections/cta-image0_110_5881.png'
import ctaProduct2 from '../../assets/landing/sections/cta-image1_110_5881.png'
import ctaProduct3 from '../../assets/landing/sections/cta-image2_110_5881.jpg'
import ctaProduct4 from '../../assets/landing/sections/cta-image3_110_5881.jpg'
import concernAcne from '../../assets/landing/image0_47_362.png'
import concernPigmentation from '../../assets/landing/image1_47_362.jpg'
import concernSensitive from '../../assets/landing/image2_47_362.png'
import concernDrought from '../../assets/landing/image3_47_362.png'
import concernWrinkles from '../../assets/landing/image4_47_362.png'
import concernFineLines from '../../assets/landing/image5_47_362.png'
import { categoryBrowsePath } from '../../utils/categoryBrowseParams'

export interface ShopHeroSlide {
  id: string
  image: string
  imageAlt: string
  /** Destination from banner API (`linkType` / `linkId` / `externalUrl`). Null when not linkable. */
  href: string | null
}

export interface ShopCategory {
  id: string
  name: string
  image: string
  href: string
}

export const shopCategories: ShopCategory[] = [
  { id: 'skin-care', name: 'Skin Care', image: concernSensitive, href: categoryBrowsePath('skin-care') },
  { id: 'hair-care', name: 'Hair Care', image: ctaProduct4, href: categoryBrowsePath('hair-care') },
  { id: 'body-care', name: 'Body Care', image: concernDrought, href: categoryBrowsePath('body-care') },
  {
    id: 'face-treatments',
    name: 'Face Treatments',
    image: ctaProduct3,
    href: categoryBrowsePath('face-treatments'),
  },
  {
    id: 'sun-protection',
    name: 'Sun Protection',
    image: ctaProduct1,
    href: categoryBrowsePath('sun-protection'),
  },
  { id: 'anti-aging', name: 'Anti-Aging', image: concernWrinkles, href: categoryBrowsePath('anti-aging') },
  { id: 'acne', name: 'Acne Solutions', image: concernAcne, href: categoryBrowsePath('acne') },
  {
    id: 'pigmentation',
    name: 'Pigmentation & Brightening',
    image: concernPigmentation,
    href: categoryBrowsePath('pigmentation'),
  },
  { id: 'sensitive', name: 'Sensitive Skin', image: concernSensitive, href: categoryBrowsePath('sensitive') },
  { id: 'mens', name: "Men's Care", image: concernFineLines, href: categoryBrowsePath('mens') },
  { id: 'womens', name: "Women's Care", image: ctaProduct2, href: categoryBrowsePath('womens') },
]
