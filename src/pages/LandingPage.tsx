// src/pages/LandingPage.tsx
import { useTranslation } from 'react-i18next'
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { BestSellerSection } from '../components/landing/best-seller/BestSellerSection'
import { ContactSection } from '../components/landing/contact/ContactSection'
import { HowItWorksSection } from '../components/landing/how-it-works/HowItWorksSection'
import { HeroSection } from '../components/landing/HeroSection'
import { SkinConcernSection } from '../components/landing/SkinConcernSection'
import { Footer } from '../components/landing/footer/Footer'
import { TrustedBySection } from '../components/landing/TrustedBySection'

export function LandingPage() {
  const { t } = useTranslation()

  return (
    <Layout>
      <PageBleed>
        <HeroSection />
        <TrustedBySection />
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
      </PageBleed>
    </Layout>
  )
}
