// src/pages/LandingPage.tsx
import { MotionConfig } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Layout } from '../components/layout/Layout'
import { BestSellerSection } from '../components/landing/best-seller/BestSellerSection'
import { ContactSection } from '../components/landing/contact/ContactSection'
import { HowItWorksSection } from '../components/landing/how-it-works/HowItWorksSection'
import { HeroSection } from '../components/landing/HeroSection'
import { SkinConcernSection } from '../components/landing/SkinConcernSection'
import { Footer } from '../components/landing/footer/Footer'

export function LandingPage() {
  const { t } = useTranslation()

  return (
    <Layout>
      <MotionConfig reducedMotion="user">
        {/* Not PageBleed: its horizontal clip would cut the full-bleed section bands. */}
        <div className="-my-4 sm:-my-5 lg:-my-6">
          <HeroSection />
          <SkinConcernSection
            title={t('home.skinConcerns.title')}
            subtitle={t('home.skinConcerns.subtitle')}
            align="center"
            size="default"
          />
          <BestSellerSection />
          <HowItWorksSection />
          <ContactSection />
          <Footer />
        </div>
      </MotionConfig>
    </Layout>
  )
}
