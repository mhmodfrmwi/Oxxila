import { Check } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../ui/interactionStyles'

type DescriptionTab = 'description' | 'advantages' | 'composition'

interface ProductDescriptionCardProps {
  description: string
  advantages: readonly string[]
  composition: readonly string[]
  className?: string
}

const tabs: { id: DescriptionTab; label: string }[] = [
  { id: 'description', label: 'Description' },
  { id: 'advantages', label: 'Advantages' },
  { id: 'composition', label: 'Composition' },
]

export function ProductDescriptionCard({
  description,
  advantages,
  composition,
  className,
}: ProductDescriptionCardProps) {
  const [activeTab, setActiveTab] = useState<DescriptionTab>('description')

  const tabContent: Record<DescriptionTab, ReactNode> = {
    description: (
      <p className="product-detail-description-text">{description}</p>
    ),
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
      <div
        className="product-detail-description-tabs"
        role="tablist"
        aria-label="Product information"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn('product-detail-tab', focusRingClasses)}
            data-active={activeTab === tab.id ? 'true' : 'false'}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="product-detail-description-panel" role="tabpanel">
        {tabContent[activeTab]}
      </div>
    </article>
  )
}
