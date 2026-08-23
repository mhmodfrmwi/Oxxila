// src/pages/admin/AdminWebsiteContentPage.tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { ContactSettingsCard } from '../../components/admin/settings/ContactSettingsCard'
import { InstagramSettingsCard } from '../../components/admin/settings/InstagramSettingsCard'
import { SocialSettingsCard } from '../../components/admin/settings/SocialSettingsCard'
import { ContentPagesCard } from '../../components/admin/website-content/ContentPagesCard'
import { HowItWorksSettingsCard } from '../../components/admin/website-content/HowItWorksSettingsCard'
import { focusRingClasses } from '../../components/ui/interactionStyles'
import { cn } from '../../lib/cn'

const TABS = ['contact', 'social', 'instagram', 'howItWorks', 'contentPages'] as const

type WebsiteContentTab = (typeof TABS)[number]

export function AdminWebsiteContentPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<WebsiteContentTab>('contact')

  return (
    <>
      <AdminPageHeader
        title={t('admin.websiteContent.title')}
        subtitle={t('admin.websiteContent.subtitle')}
      />

      <div
        className="mb-[var(--admin-content-gap-tight)] flex gap-4 overflow-x-auto border-b border-white/10"
        role="tablist"
        aria-label={t('admin.websiteContent.tabsAria')}
      >
        {TABS.map((tab) => {
          const isActive = tab === activeTab
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'relative shrink-0 px-2 pb-[14px] text-sm transition-colors',
                focusRingClasses,
                isActive
                  ? 'border-b-2 border-accent pb-[13.2px] font-semibold text-accent'
                  : 'font-medium text-white/40 hover:text-white/60',
              )}
            >
              {t(`admin.websiteContent.tabs.${tab}`)}
            </button>
          )
        })}
      </div>

      <div role="tabpanel">
        {activeTab === 'contact' ? <ContactSettingsCard /> : null}
        {activeTab === 'social' ? <SocialSettingsCard /> : null}
        {activeTab === 'instagram' ? <InstagramSettingsCard /> : null}
        {activeTab === 'howItWorks' ? <HowItWorksSettingsCard /> : null}
        {activeTab === 'contentPages' ? <ContentPagesCard /> : null}
      </div>
    </>
  )
}
