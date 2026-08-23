// src/components/product/ProductDescriptionCard.tsx
import { Check } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../ui/interactionStyles'

type DescriptionTab = 'description' | 'advantages' | 'composition'

interface ProductDescriptionCardProps {
  description: string
  advantages: readonly string[]
  composition: readonly string[]
  className?: string
}

const TAB_IDS: DescriptionTab[] = ['description', 'advantages', 'composition']

export function ProductDescriptionCard({
  description,
  advantages,
  composition,
  className,
}: ProductDescriptionCardProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<DescriptionTab>('description')

  const tabContent: Record<DescriptionTab, ReactNode> = {
    description: <p className="product-detail-description-text">{description}</p>,
    advantages: (
      <ul className="space-y-3">
        {advantages.map((item) => (
          <li key={item} className="product-detail-check-item">
            <span className="product-detail-check-icon" aria-hidden>
              <Check size={12} strokeWidth={2.5} />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ),
    composition: (
      <ul className="space-y-3">
        {composition.map((item) => (
          <li key={item} className="product-detail-check-item">
            <span className="product-detail-check-icon" aria-hidden>
              <Check size={12} strokeWidth={2.5} />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ),
  }

  return (
    <article
      className={cn('product-detail-description-card flex min-w-0 flex-col', className)}
    >
      <div className="product-detail-description-shell" data-active-tab={activeTab}>
        <div
          className="product-detail-description-tabs"
          role="tablist"
          aria-label={t('productDetail.tabs.ariaLabel')}
        >
          {TAB_IDS.map((tabId) => {
            const tabButtonId = `product-tab-${tabId}`
            const panelId = `product-panel-${tabId}`
            return (
              <button
                key={tabId}
                id={tabButtonId}
                type="button"
                role="tab"
                aria-selected={activeTab === tabId}
                aria-controls={panelId}
                onClick={() => setActiveTab(tabId)}
                className={cn('product-detail-tab', focusRingClasses)}
                data-active={activeTab === tabId ? 'true' : 'false'}
              >
                {t(`productDetail.tabs.${tabId}`)}
              </button>
            )
          })}
        </div>

        <div
          id={`product-panel-${activeTab}`}
          className="product-detail-description-panel"
          role="tabpanel"
          aria-labelledby={`product-tab-${activeTab}`}
        >
          {tabContent[activeTab]}
        </div>
      </div>
    </article>
  )
}
