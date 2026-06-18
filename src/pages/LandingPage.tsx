import { Layout } from '../components/layout/Layout'
import { BestSellerSection } from '../components/landing/best-seller/BestSellerSection'
import { ContactSection } from '../components/landing/contact/ContactSection'
import { HowItWorksSection } from '../components/landing/how-it-works/HowItWorksSection'
import { HeroSection } from '../components/landing/HeroSection'
import { SkinConcernSection } from '../components/landing/SkinConcernSection'
import { Footer } from '../components/landing/footer/Footer'
import { TrustedBySection } from '../components/landing/TrustedBySection'
import { LandingCatalogProvider } from '../context/LandingCatalogContext'

export function LandingPage() {
  return (
    <Layout>
      <LandingCatalogProvider>
        <div className="-mx-3 -my-4 overflow-x-clip sm:-mx-4 sm:-my-5 lg:-mx-6 lg:-my-6">
          <HeroSection />
          <TrustedBySection />
          <SkinConcernSection />
          <BestSellerSection />
          <HowItWorksSection />
          <ContactSection />
          <Footer />
        </div>
      </LandingCatalogProvider>
    </Layout>
  )
}
