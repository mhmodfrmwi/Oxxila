// src/pages/DocsPage.tsx
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getContentPage,
  type ApiContentPage,
  type ContentPageSlug,
} from '../api/settings'
import { AboutAuthenticityCtaSection } from '../components/about/AboutAuthenticityCtaSection'
import { AboutHeroSection } from '../components/about/AboutHeroSection'
import { AboutInfrastructureSection } from '../components/about/AboutInfrastructureSection'
import { AboutIntroSection } from '../components/about/AboutIntroSection'
import { AboutMedicalSection } from '../components/about/AboutMedicalSection'
import { AboutQualitySection } from '../components/about/AboutQualitySection'
import { Footer } from '../components/landing/footer/Footer'
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { RouteFallback } from '../components/ui/RouteFallback'
import { ApiError } from '../lib/api'
import { aboutSectionCopy, findAboutSection } from '../utils/aboutCopy'
import { isEmptyContentPage, plainTextParagraphs } from '../utils/contentPage'

const DOCS_SLUGS = [
  'about',
  'privacy',
  'refund-policy',
  'shipping-policy',
] as const satisfies readonly ContentPageSlug[]

const POLICY_SECTIONS = [
  {
    slug: 'privacy',
    anchor: 'privacy',
    titleKey: 'contentPage.titles.privacy',
  },
  {
    slug: 'refund-policy',
    anchor: 'refund-policy',
    titleKey: 'contentPage.titles.refundPolicy',
  },
  {
    slug: 'shipping-policy',
    anchor: 'shipping-policy',
    titleKey: 'contentPage.titles.shippingPolicy',
  },
] as const

type DocsPagesMap = Partial<Record<ContentPageSlug, ApiContentPage | null>>

function useDocsPages() {
  const [pages, setPages] = useState<DocsPagesMap>({})
  const [loading, setLoading] = useState(true)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const requestId = ++requestIdRef.current
    setLoading(true)

    void (async () => {
      try {
        const results = await Promise.all(
          DOCS_SLUGS.map(async (slug) => {
            try {
              const response = await getContentPage(slug)
              return [slug, response.data ?? null] as const
            } catch (error) {
              if (error instanceof ApiError) return [slug, null] as const
              return [slug, null] as const
            }
          }),
        )
        if (requestId !== requestIdRef.current) return
        setPages(Object.fromEntries(results))
      } finally {
        if (requestId === requestIdRef.current) setLoading(false)
      }
    })()
  }, [])

  return { pages, loading }
}

/**
 * Static About layout (CMS text overrides) + dynamic policy sections below.
 */
export function DocsPage() {
  const { t } = useTranslation()
  const { pages, loading } = useDocsPages()
  const about = pages.about ?? null
  const intro = aboutSectionCopy(findAboutSection(about, 'intro'))
  const quality = aboutSectionCopy(findAboutSection(about, 'quality'))
  const medical = aboutSectionCopy(findAboutSection(about, 'medical'))
  const infrastructure = aboutSectionCopy(findAboutSection(about, 'infrastructure'))
  const authenticity = aboutSectionCopy(findAboutSection(about, 'authenticity'))

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash || loading) return
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [loading])

  if (loading && !about) {
    return (
      <Layout>
        <RouteFallback />
      </Layout>
    )
  }

  return (
    <Layout
      utilityPromo={{
        title: t('shop.promo.title'),
        subtitle: t('shop.promo.subtitle'),
      }}
    >
      <PageBleed>
        <AboutHeroSection />
        <AboutIntroSection
          eyebrow={intro?.subtitle}
          title={intro?.title}
          paragraphs={intro?.paragraphs}
          cards={intro?.items}
        />
        <AboutQualitySection
          title={quality?.title}
          subtitle={quality?.subtitle}
          cards={quality?.items}
        />
        <AboutMedicalSection
          title={medical?.title}
          subtitle={medical?.subtitle}
          cards={medical?.items}
        />
        <AboutInfrastructureSection
          title={infrastructure?.title}
          cards={infrastructure?.items}
        />
        <AboutAuthenticityCtaSection
          title={authenticity?.title}
          description={authenticity?.paragraphs?.[0]}
          buttonLabel={authenticity?.buttonLabel}
        />

        <div className="docs-policies">
          <div className="docs-policies__intro">
            <p className="docs-policies__eyebrow">{t('docs.policiesEyebrow')}</p>
            <h2 className="docs-policies__heading">{t('docs.policiesHeading')}</h2>
            <p className="docs-policies__lede">{t('docs.policiesLede')}</p>
          </div>

          <div className="docs-policies__grid">
            {POLICY_SECTIONS.map((section) => {
              const page = pages[section.slug]
              const title = page?.title?.trim() || t(section.titleKey)
              const subtitle = page?.subtitle?.trim() || ''
              const empty = isEmptyContentPage(page)
              const blocks = page?.sections ?? []

              return (
                <section
                  key={section.slug}
                  id={section.anchor}
                  className="docs-policy-card scroll-mt-24"
                  aria-labelledby={`${section.anchor}-title`}
                >
                  <header className="docs-policy-card__header">
                    <h2 id={`${section.anchor}-title`} className="docs-policy-card__title">
                      {title}
                    </h2>
                    {subtitle ? (
                      <p className="docs-policy-card__subtitle">{subtitle}</p>
                    ) : null}
                  </header>

                  {empty ? (
                    <p className="docs-policy-card__muted">
                      {t('contentPage.emptyDescription')}
                    </p>
                  ) : (
                    <ol className="docs-policy-card__list">
                      {blocks.map((block, index) => {
                        if (!block.title.trim() && !block.body.trim()) return null
                        const paragraphs = plainTextParagraphs(block.body)
                        return (
                          <li key={block.key} className="docs-policy-card__item">
                            <span className="docs-policy-card__index" aria-hidden>
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <div className="docs-policy-card__item-body">
                              {block.title.trim() ? (
                                <h3 className="docs-policy-card__item-title">{block.title}</h3>
                              ) : null}
                              {paragraphs.map((paragraph, pIndex) => (
                                <p
                                  key={`${block.key}-p-${pIndex}`}
                                  className="docs-policy-card__item-text"
                                >
                                  {paragraph}
                                </p>
                              ))}
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                  )}
                </section>
              )
            })}
          </div>
        </div>

        <Footer />
      </PageBleed>
    </Layout>
  )
}
