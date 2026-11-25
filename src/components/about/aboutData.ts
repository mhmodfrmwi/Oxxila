// src/components/about/aboutData.ts
import type { LucideIcon } from 'lucide-react'
import {
  BadgeCheck,
  BriefcaseMedical,
  Building2,
  ClipboardCheck,
  FlaskConical,
  Microscope,
  ScrollText,
  Shield,
  ShoppingBag,
  Truck,
  Warehouse,
} from 'lucide-react'
import aboutHeroImage from '../../assets/about/about-hero.webp'
import aboutSphereImage from '../../assets/about/about-sphere.webp'

export { aboutHeroImage, aboutSphereImage }

export const ABOUT_INTRO_CARD_IDS = ['formulations', 'imports'] as const
export const ABOUT_QUALITY_IDS = ['eda', 'gmp', 'iso'] as const
export const ABOUT_MEDICAL_IDS = ['rd', 'protocols', 'content'] as const
export const ABOUT_INFRASTRUCTURE_IDS = ['facility', 'warehouse', 'supply'] as const

export type AboutIntroCardId = (typeof ABOUT_INTRO_CARD_IDS)[number]
export type AboutQualityId = (typeof ABOUT_QUALITY_IDS)[number]
export type AboutMedicalId = (typeof ABOUT_MEDICAL_IDS)[number]
export type AboutInfrastructureId = (typeof ABOUT_INFRASTRUCTURE_IDS)[number]

export const aboutIntroIcons: Record<AboutIntroCardId, LucideIcon> = {
  formulations: FlaskConical,
  imports: ShoppingBag,
}

export const aboutQualityIcons: Record<AboutQualityId, LucideIcon> = {
  eda: Shield,
  gmp: ClipboardCheck,
  iso: BadgeCheck,
}

export const aboutMedicalIcons: Record<AboutMedicalId, LucideIcon> = {
  rd: Microscope,
  protocols: BriefcaseMedical,
  content: ScrollText,
}

export const aboutInfrastructureIcons: Record<AboutInfrastructureId, LucideIcon> = {
  facility: Building2,
  warehouse: Warehouse,
  supply: Truck,
}
