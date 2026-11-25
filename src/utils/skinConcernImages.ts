// src/utils/skinConcernImages.ts
import concernAcne from '../assets/landing/image5_47_362.webp'
import concernPigmentation from '../assets/landing/frame.svg'
import concernSensitive from '../assets/landing/frame2.svg'
import concernDrought from '../assets/landing/frame3.svg'
import concernWrinkles from '../assets/landing/frame4.svg'
import concernWidePores from '../assets/landing/frame5.svg'

/** Final static assets for the shared Skin Concerns section. */
export const SKIN_CONCERN_IMAGES: Record<string, string> = {
  acne: concernAcne,
  pigmentation: concernPigmentation,
  'sensitive-skin': concernSensitive,
  sensitive: concernSensitive,
  drought: concernDrought,
  wrinkles: concernWrinkles,
  'wide-pores': concernWidePores,
}
