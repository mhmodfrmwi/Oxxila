import { useTranslation } from 'react-i18next'
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { AboutAuthenticityCtaSection } from '../components/about/AboutAuthenticityCtaSection'
import { AboutHeroSection } from '../components/about/AboutHeroSection'
import { AboutInfrastructureSection } from '../components/about/AboutInfrastructureSection'
import { AboutIntroSection } from '../components/about/AboutIntroSection'
import { AboutMedicalSection } from '../components/about/AboutMedicalSection'
import { AboutQualitySection } from '../components/about/AboutQualitySection'
import { Footer } from '../components/landing/footer/Footer'

export function DocsPage() {
  const { t } = useTranslation()

  return (
    <Layout
      utilityPromo={{
        title: t('shop.promo.title'),
        subtitle: t('shop.promo.subtitle'),
      }}
    >
      <PageBleed>
        <AboutHeroSection />
        <AboutIntroSection />
        <AboutQualitySection />
        <AboutMedicalSection />
        <AboutInfrastructureSection />
        <AboutAuthenticityCtaSection />
        <Footer />
      </PageBleed>
    </Layout>
  )
}
