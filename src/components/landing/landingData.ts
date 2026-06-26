import heroBrushDark from '../../assets/landing/Subtract(3).svg'
import heroImage from '../../assets/landing/sections/hero-image0_110_4575.jpg'
import heroCollageImage from '../../assets/landing/sections/hero-image1_110_4575.png'
import heroRightProduct from '../../assets/landing/sections/hero-image2_110_4575.png'
import heroLeftProduct from '../../assets/landing/sections/hero-image3_110_4575.png'
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
import howItWorksThumb from '../../assets/landing/image14_47_362.jpg'

export const HERO_BLOB_PATH =
  'M1260 29.9998C1315.23 29.9998 1360 74.7713 1360 130V330.149C1360 357.763 1337.61 380.149 1310 380.149H1131C1103.39 380.149 1081 402.535 1081 430.149V636C1081 663.614 1058.61 686 1031 686H1006.02C983.963 686 962.52 678.704 945.036 665.249L792.66 547.985C756.164 519.899 705.206 520.369 669.233 549.124L525.383 664.111C507.657 678.281 485.638 686 462.944 686H411C383.386 686 361 663.614 361 636V430.149C361 402.535 338.614 380.149 311 380.149H130C102.386 380.149 80 357.763 80 330.149V130C80 74.7713 124.772 29.9998 180 29.9998H1260Z'

export const HERO_RIGHT_BLOB_PATH =
  'M1257.67 395.149C1271.15 395.149 1281 416.173 1281 429.649C1281 454.778 1301.37 475.149 1326.5 475.149C1339.88 475.149 1360 484.714 1360 498.093V636.149C1360 663.763 1337.61 686.149 1310 686.149H1143C1115.39 686.149 1093 663.763 1093 636.149V445.149C1093 417.535 1115.39 395.149 1143 395.149H1257.67Z'

export const HERO_LEFT_BLOB_PATH =
  'M130 395.149C102.386 395.149 80 417.535 80 445.149V581.205C80 594.583 100.121 604.149 113.5 604.149C138.629 604.149 159 624.52 159 649.649C159 663.175 169.504 686.149 183.029 686.149H297C324.614 686.149 347 663.763 347 636.149V445.149C347 417.535 324.614 395.149 297 395.149H130Z'

export const skinConcerns = [
  { id: 'acne', name: 'Acne', image: concernAcne },
  { id: 'pigmentation', name: 'Pigmentation', image: concernPigmentation },
  { id: 'sensitive', name: 'Sensitive skin', image: concernSensitive },
  { id: 'drought', name: 'Drought', image: concernDrought },
  { id: 'wrinkles', name: 'Wrinkles', image: concernWrinkles },
  { id: 'wide-pores', name: 'Wide pores', image: concernFineLines },
] as const

export const bestSellerProducts = [
  {
    id: 'bs-1',
    title: 'Garnier Micellar Water Face Cleanser & Daily Makeup Remover',
    price: 299,
    originalPrice: 350,
    rating: 4.3,
    reviewCount: 215,
    image: ctaProduct1,
  },
  {
    id: 'bs-2',
    title: 'Oxxila Hydrating Vitamin C Brightening Serum',
    price: 249,
    originalPrice: 310,
    rating: 4.5,
    reviewCount: 1840,
    image: ctaProduct2,
  },
  {
    id: 'bs-3',
    title: 'Radiance Renewal Night Repair Cream with Peptides',
    price: 329,
    originalPrice: 399,
    rating: 4.7,
    reviewCount: 2100,
    image: ctaProduct3,
  },
  {
    id: 'bs-4',
    title: 'Gentle Daily Glow Toner for Sensitive Skin',
    price: 189,
    originalPrice: 240,
    rating: 4.2,
    reviewCount: 980,
    image: ctaProduct4,
  },
  {
    id: 'bs-5',
    title: 'Deep Moisture Barrier Daily Hydrating Cream',
    price: 279,
    originalPrice: 340,
    rating: 4.6,
    reviewCount: 1520,
    image: ctaProduct5,
  },
] as const

export const howItWorksSteps = [
  {
    id: 'concern',
    title: 'Choose Your Skin Concern',
    description:
      "Select your main concern — acne, pigmentation, sensitivity, dryness, or pores — and we'll instantly filter the right products for you.",
  },
  {
    id: 'explanations',
    title: 'Get Clear, Doctor-Based Explanations',
    description:
      'Understand ingredients and routines with expert-backed guidance tailored to your unique skin profile and goals.',
  },
  {
    id: 'checkout',
    title: 'One Step Checkout & Delivery',
    description:
      'Add to cart, checkout securely, and get dermatologist-trusted products delivered straight to your door.',
  },
] as const

export const contactInfo = [
  { id: 'call', label: 'Call', value: '080 152 111 55 17', href: 'tel:0801521115517' },
  { id: 'email', label: 'Email', value: 'contact@oxilla.com', href: 'mailto:contact@oxilla.com' },
  { id: 'location', label: 'Location', value: 'Texas, USA', href: undefined },
] as const

export const footerPolicyLinks = [
  { label: 'About Oxxila', to: '/about' },
  { label: 'Our Quality Promise', to: '/quality' },
  { label: 'Authenticity Guarantee', to: '/authenticity' },
  { label: 'Dermatology Standards', to: '/standards' },
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Contact Us', to: '/contact' },
] as const

export const footerShoppingLinks = [
  { label: 'Shop All Products', to: '/shop' },
  { label: 'Skin Concerns', to: '/concerns' },
  { label: 'Brands', to: '/brands' },
  { label: 'New Arrivals', to: '/shop?filter=new' },
  { label: 'Best Sellers', to: '/shop?filter=best' },
  { label: 'Shipping & Delivery', to: '/shipping' },
  { label: 'Returns & Refunds', to: '/returns' },
  { label: 'Track Your Order', to: '/track' },
] as const

export const footerInstagramImages = [
  { id: 'ig-1', src: ctaProduct1, alt: 'Skincare product on vanity' },
  { id: 'ig-2', src: ctaProduct2, alt: 'Glow serum application' },
  { id: 'ig-3', src: ctaProduct3, alt: 'Vitamin C skincare routine' },
  { id: 'ig-4', src: ctaProduct4, alt: 'Night repair cream texture' },
] as const

export const footerSocialLinks = [
  { id: 'facebook', label: 'Facebook', href: 'https://facebook.com' },
  { id: 'twitter', label: 'X (Twitter)', href: 'https://twitter.com' },
  { id: 'instagram', label: 'Instagram', href: 'https://instagram.com' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com' },
  { id: 'youtube', label: 'YouTube', href: 'https://youtube.com' },
] as const

export {
  heroBrushDark,
  heroImage,
  heroCollageImage,
  heroRightProduct,
  heroLeftProduct,
  howItWorksThumb,
}
