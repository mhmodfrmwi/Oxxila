// src/pages/AboutPage.tsx
import { useTranslation } from 'react-i18next'
import { AboutAuthenticityCtaSection } from '../components/about/AboutAuthenticityCtaSection'
import { AboutHeroSection } from '../components/about/AboutHeroSection'
import { AboutInfrastructureSection } from '../components/about/AboutInfrastructureSection'
import { AboutIntroSection } from '../components/about/AboutIntroSection'
import { AboutMedicalSection } from '../components/about/AboutMedicalSection'
import { AboutQualitySection } from '../components/about/AboutQualitySection'
import { Footer } from '../components/landing/footer/Footer'
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { Button } from '../components/ui/Button'
import { RouteFallback } from '../components/ui/RouteFallback'
import { useContentPage } from '../hooks/useContentPage'
import { aboutHeroImage } from '../components/about/aboutData'
import { isPlaceholderContent } from '../utils/contentPage'

/**
 * Storefront About — prefers CMS `GET /settings/pages/about`.
 * Falls back to the designed static sections when CMS body/sections are empty.
 */
export function AboutPage() {
  const { t } = useTranslation()
  const { page, loading, error } = useContentPage('about')

  if (loading) {
    return (
      <Layout>
        <RouteFallback />
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout
        utilityPromo={{
          title: t('shop.promo.title'),
          subtitle: t('shop.promo.subtitle'),
        }}
      >
        <PageBleed>
          <div className="content-page">
            <div className="content-page__empty">
              <h1 className="content-page__empty-title">{t('contentPage.errorTitle')}</h1>
              <p className="content-page__empty-body">{error}</p>
              <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                {t('contentPage.retry')}
              </Button>
            </div>
          </div>
          <Footer />
        </PageBleed>
      </Layout>
    )
  }

  const sections = (page?.sections ?? []).filter(
    (section) => section.title.trim() || section.body.trim() || section.image,
  )
  const hasCmsBody = Boolean(page && !isPlaceholderContent(page.content))
  const useCms = Boolean(page && (hasCmsBody || sections.length > 0))

  return (
    <Layout
      utilityPromo={{
        title: t('shop.promo.title'),
        subtitle: t('shop.promo.subtitle'),
      }}
    >
      <PageBleed>
        {useCms && page ? (
          <>
            <section
              className="container-content py-6 sm:py-8 lg:py-10"
              aria-labelledby="about-hero-title"
            >
              <div className="about-hero">
                <div className="about-hero__media" aria-hidden>
                  <img
                    src={aboutHeroImage}
                    alt=""
                    className="about-hero__image"
                    loading="eager"
                    fetchPriority="high"
                  />
                  <div className="about-hero__overlay" />
                </div>
                <div className="about-hero__content">
                  <h1 id="about-hero-title" className="about-hero__title">
                    {page.title || t('about.hero.title')}
                  </h1>
                  <p className="about-hero__subtitle">
                    {page.subtitle || t('about.hero.subtitle')}
                  </p>
                </div>
              </div>
            </section>

            <div className="container-content flex flex-col gap-10 pb-12 sm:gap-12 sm:pb-16">
              {hasCmsBody ? (
                <div
                  className="content-page__prose mx-auto max-w-3xl"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              ) : null}

              {sections.map((section) => (
                <section
                  key={section.key}
                  id={section.key}
                  className="scroll-mt-24 rounded-[1.75rem] border border-border-subtle bg-card p-6 sm:p-8 lg:p-10"
                >
                  {section.title ? (
                    <h2 className="font-serif text-2xl font-medium text-primary-text sm:text-3xl">
                      {section.title}
                    </h2>
                  ) : null}
                  {section.image ? (
                    <img
                      src={section.image}
                      alt=""
                      className="mt-6 w-full max-h-80 rounded-2xl object-cover"
                    />
                  ) : null}
                  {section.body ? (
                    <div
                      className="content-page__prose mt-4"
                      dangerouslySetInnerHTML={{ __html: section.body }}
                    />
                  ) : null}
                </section>
              ))}
            </div>
          </>
        ) : (
          <>
            <AboutHeroSection />
            <AboutIntroSection />
            <AboutQualitySection />
            <AboutMedicalSection />
            <AboutInfrastructureSection />
            <AboutAuthenticityCtaSection />
          </>
        )}
        <Footer />
      </PageBleed>
    </Layout>
  )
}
