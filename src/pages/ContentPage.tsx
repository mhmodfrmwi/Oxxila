// src/pages/ContentPage.tsx
import { FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { ContentPageSlug } from '../api/settings'
import { Footer } from '../components/landing/footer/Footer'
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { Button } from '../components/ui/Button'
import { RouteFallback } from '../components/ui/RouteFallback'
import { HOME_PATH } from '../config/routes'
import { useContentPage } from '../hooks/useContentPage'
import { cn } from '../lib/cn'
import {
  isEmptyContentPage,
  plainTextParagraphs,
} from '../utils/contentPage'

interface ContentPageProps {
  slug: ContentPageSlug
}

const slugTitleKey: Record<Exclude<ContentPageSlug, 'about'>, string> = {
  terms: 'contentPage.titles.terms',
  privacy: 'contentPage.titles.privacy',
  'refund-policy': 'contentPage.titles.refundPolicy',
  'shipping-policy': 'contentPage.titles.shippingPolicy',
}

export function ContentPage({ slug }: ContentPageProps) {
  const { t } = useTranslation()
  const { page, loading, error } = useContentPage(slug)

  if (loading) {
    return (
      <Layout>
        <RouteFallback />
      </Layout>
    )
  }

  if (error || !page) {
    return (
      <Layout>
        <PageBleed>
          <div className="content-page">
            <div className="content-page__empty">
              <span className="content-page__empty-icon" aria-hidden>
                <FileText size={28} />
              </span>
              <h1 className="content-page__empty-title">{t('contentPage.errorTitle')}</h1>
              <p className="content-page__empty-body">
                {error ?? t('contentPage.errorDescription')}
              </p>
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

  const fallbackTitle =
    slug === 'about'
      ? page.title
      : t(slugTitleKey[slug as Exclude<ContentPageSlug, 'about'>], {
          defaultValue: page.title,
        })
  const title = page.title?.trim() || fallbackTitle
  const subtitle = page.subtitle?.trim() || ''
  const empty = isEmptyContentPage(page)

  return (
    <Layout>
      <PageBleed>
        <article className="content-page">
          <header className="content-page__hero">
            <p className="content-page__eyebrow">{t('contentPage.eyebrow')}</p>
            <h1 className="content-page__title">{title}</h1>
            {subtitle ? <p className="content-page__subtitle">{subtitle}</p> : null}
          </header>

          {empty ? (
            <div className="content-page__empty" role="status">
              <span className="content-page__empty-icon" aria-hidden>
                <FileText size={28} />
              </span>
              <h2 className="content-page__empty-title">{t('contentPage.emptyTitle')}</h2>
              <p className="content-page__empty-body">{t('contentPage.emptyDescription')}</p>
              <Link to={HOME_PATH} className={cn('content-page__empty-link')}>
                {t('contentPage.backHome')}
              </Link>
            </div>
          ) : (
            <div className="content-page__body">
              {page.sections.map((section) => {
                if (!section.title.trim() && !section.body.trim()) return null
                const paragraphs = plainTextParagraphs(section.body)
                return (
                  <section key={section.key} id={section.key} className="content-page__section">
                    {section.title ? (
                      <h2 className="content-page__section-title">{section.title}</h2>
                    ) : null}
                    {section.subtitle?.trim() ? (
                      <p className="content-page__subtitle">{section.subtitle}</p>
                    ) : null}
                    {paragraphs.length > 0 ? (
                      <div className="content-page__prose">
                        {paragraphs.map((paragraph, index) => (
                          <p key={`${section.key}-p-${index}`}>{paragraph}</p>
                        ))}
                      </div>
                    ) : null}
                  </section>
                )
              })}
            </div>
          )}
        </article>
        <Footer />
      </PageBleed>
    </Layout>
  )
}
