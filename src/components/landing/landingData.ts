import heroBrushDark from '../../assets/landing/Subtract(3).svg'
import heroImage from '../../assets/landing/sections/hero-image0_110_4575.webp'
import heroCollageImage from '../../assets/landing/sections/hero-image1_110_4575.png'
import heroRightProduct from '../../assets/landing/sections/hero-image2_110_4575.webp'
import heroLeftProduct from '../../assets/landing/sections/hero-image3_110_4575.webp'
import ctaProduct1 from '../../assets/landing/sections/cta-image0_110_5881.webp'
import ctaProduct2 from '../../assets/landing/sections/cta-image1_110_5881.webp'
import ctaProduct3 from '../../assets/landing/sections/cta-image2_110_5881.jpg'
import ctaProduct4 from '../../assets/landing/sections/cta-image3_110_5881.jpg'
import howItWorksThumb from '../../assets/landing/image14_47_362.jpg'

export const HERO_BLOB_PATH =
  'M1260 29.9998C1315.23 29.9998 1360 74.7713 1360 130V330.149C1360 357.763 1337.61 380.149 1310 380.149H1131C1103.39 380.149 1081 402.535 1081 430.149V636C1081 663.614 1058.61 686 1031 686H411C383.386 686 361 663.614 361 636V430.149C361 402.535 338.614 380.149 311 380.149H130C102.386 380.149 80 357.763 80 330.149V130C80 74.7713 124.772 29.9998 180 29.9998H1260Z'

export const HERO_RIGHT_BLOB_PATH =
  'M1257.67 395.149C1271.15 395.149 1281 416.173 1281 429.649C1281 454.778 1301.37 475.149 1326.5 475.149C1339.88 475.149 1360 484.714 1360 498.093V636.149C1360 663.763 1337.61 686.149 1310 686.149H1143C1115.39 686.149 1093 663.763 1093 636.149V445.149C1093 417.535 1115.39 395.149 1143 395.149H1257.67Z'

export const HERO_LEFT_BLOB_PATH =
  'M130 395.149C102.386 395.149 80 417.535 80 445.149V581.205C80 594.583 100.121 604.149 113.5 604.149C138.629 604.149 159 624.52 159 649.649C159 663.175 169.504 686.149 183.029 686.149H297C324.614 686.149 347 663.763 347 636.149V445.149C347 417.535 324.614 395.149 297 395.149H130Z'

export const contactInfo = [
  { id: 'call', label: 'Call', value: '080 152 111 55 17', href: 'tel:0801521115517' },
  { id: 'email', label: 'Email', value: 'contact@oxilla.com', href: 'mailto:contact@oxilla.com' },
  { id: 'whatsapp', label: 'WhatsApp', value: '', href: undefined as string | undefined },
  { id: 'location', label: 'Location', value: 'Texas, USA', href: undefined as string | undefined },
] as const

export type ContactInfoId = (typeof contactInfo)[number]['id']

export type ContactInfoItem = {
  id: ContactInfoId
  label: string
  value: string
  href?: string
}

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
