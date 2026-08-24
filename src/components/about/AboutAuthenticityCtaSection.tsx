// src/components/about/AboutAuthenticityCtaSection.tsx
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import oxxilaLogo from '../../assets/Oxxila.svg'
import { DOCS_PATH } from '../../config/routes'
import { Button } from '../ui/Button'

interface AboutAuthenticityCtaSectionProps {
  title?: string | null
  description?: string | null
  buttonLabel?: string | null
}

export function AboutAuthenticityCtaSection({
  title,
  description,
  buttonLabel,
}: AboutAuthenticityCtaSectionProps = {}) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <section
      id="authenticity"
      className="container-content scroll-mt-24 pb-10 sm:pb-12 lg:pb-16"
      aria-labelledby="about-cta-title"
    >
      <div className="about-cta-panel">
        <img src={oxxilaLogo} alt="" aria-hidden className="about-cta-panel__watermark" />

        <div className="about-cta-panel__content">
          <h2 id="about-cta-title" className="about-cta-panel__title">
            {title?.trim() || t('about.cta.title')}
          </h2>
          <p className="about-cta-panel__description">
            {description?.trim() || t('about.cta.description')}
          </p>
          <div className="about-cta-panel__button">
            <Button
              type="button"
              variant="primary"
              pill
              className="min-w-[12rem] px-8"
              onClick={() => {
                const target = document.getElementById('quality')
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  return
                }
                navigate(`${DOCS_PATH}#quality`)
              }}
            >
              {buttonLabel?.trim() || t('about.cta.button')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
