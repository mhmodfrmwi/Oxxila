// src/components/admin/website-content/ContentPagesCard.tsx
import { ArrowDown, ArrowUp, FileText, Loader2, Plus, Trash2 } from 'lucide-react'
import { useId, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../context/ToastContext'
import {
  ABOUT_SECTION_KEYS,
  useAdminContentPages,
  type AboutSectionKey,
} from '../../../hooks/useAdminContentPages'
import { useAdminPermissions } from '../../../hooks/useAdminPermissions'
import { cn } from '../../../lib/cn'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'

const fieldClass = cn(
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2',
  'text-sm text-white placeholder:text-white/40',
  focusRingClasses,
)

const labelClass = 'mb-1 block text-[11px] font-medium text-white/50'

export function ContentPagesCard() {
  const { t } = useTranslation()
  const toast = useToast()
  const formId = useId()
  const { can } = useAdminPermissions()
  const canUpdate = can('websiteContent', 'update')
  const {
    pages,
    slugs,
    selectedSlug,
    page,
    loadingList,
    loadingPage,
    saving,
    error,
    selectSlug,
    setField,
    setSectionField,
    setSectionItemField,
    addSection,
    removeSection,
    moveSection,
    save,
    reloadList,
    reloadPage,
  } = useAdminContentPages()

  const isAbout = selectedSlug === 'about'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canUpdate) return
    try {
      await save()
      toast.success(t('admin.websiteContent.contentPages.saveSuccess'))
    } catch {
      toast.error(t('admin.websiteContent.contentPages.saveError'))
    }
  }

  return (
    <GlassCard aria-labelledby={`${formId}-title`}>
      <div className="mb-4 flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent">
          <FileText size={18} aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id={`${formId}-title`} className="text-base font-bold leading-6 text-white">
            {t('admin.websiteContent.contentPages.title')}
          </h2>
          <p className="mt-1 text-sm leading-5 text-white/55">
            {t('admin.websiteContent.contentPages.subtitle')}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <nav
          className="flex shrink-0 flex-row gap-2 overflow-x-auto lg:w-44 lg:flex-col lg:overflow-visible"
          aria-label={t('admin.websiteContent.contentPages.navAria')}
        >
          {loadingList
            ? slugs.map((slug) => (
                <Skeleton key={slug} className="h-10 w-full rounded-lg" />
              ))
            : slugs.map((slug) => {
                const item = pages.find((entry) => entry.slug === slug)
                const isActive = slug === selectedSlug
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => selectSlug(slug)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-start text-sm transition-colors',
                      focusRingClasses,
                      isActive
                        ? 'border-accent/40 bg-accent/10 font-semibold text-accent'
                        : 'border-white/10 bg-white/[0.03] font-medium text-white/60 hover:text-white/80',
                    )}
                  >
                    <span className="block truncate">
                      {t(`admin.websiteContent.contentPages.slugs.${slug}`)}
                    </span>
                    {item && !item.isPublished ? (
                      <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-white/40">
                        {t('admin.websiteContent.contentPages.draft')}
                      </span>
                    ) : null}
                  </button>
                )
              })}
        </nav>

        <div className="min-w-0 flex-1">
          {loadingPage ? (
            <div className="space-y-3" aria-hidden>
              {[0, 1, 2].map((index) => (
                <Skeleton key={index} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : error && !page ? (
            <EmptyState
              title={t('admin.settings.loadErrorTitle')}
              description={error}
              action={
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    void reloadList()
                    void reloadPage()
                  }}
                >
                  {t('admin.settings.retry')}
                </Button>
              }
            />
          ) : page ? (
            <form
              className="space-y-3"
              onSubmit={(event) => void handleSubmit(event)}
              noValidate
            >
              {!isAbout ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor={`${formId}-page-title`}>
                      {t('admin.websiteContent.contentPages.pageTitle')}
                    </label>
                    <input
                      id={`${formId}-page-title`}
                      type="text"
                      value={page.title}
                      disabled={saving}
                      onChange={(event) => setField('title', event.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor={`${formId}-page-subtitle`}>
                      {t('admin.websiteContent.contentPages.pageSubtitle')}
                    </label>
                    <input
                      id={`${formId}-page-subtitle`}
                      type="text"
                      value={page.subtitle}
                      disabled={saving}
                      onChange={(event) => setField('subtitle', event.target.value)}
                      className={fieldClass}
                    />
                  </div>
                </div>
              ) : null}

              <p className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/45">
                {isAbout
                  ? t('admin.websiteContent.contentPages.aboutHint')
                  : t('admin.websiteContent.contentPages.policyHint')}
              </p>

              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/45">
                  {isAbout
                    ? t('admin.websiteContent.contentPages.aboutSectionsHeading')
                    : t('admin.websiteContent.contentPages.policySectionsHeading')}
                </p>
                {!isAbout ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={addSection}
                    className="min-h-8 px-3 py-1.5 text-xs"
                  >
                    <Plus size={14} aria-hidden />
                    {t('admin.websiteContent.contentPages.addSection')}
                  </Button>
                ) : null}
              </div>

              {page.sections.length === 0 ? (
                <p className="text-sm text-white/45">
                  {t('admin.websiteContent.contentPages.noSections')}
                </p>
              ) : (
                page.sections.map((section, index) => {
                  const aboutKey = ABOUT_SECTION_KEYS.includes(
                    section.key as AboutSectionKey,
                  )
                    ? (section.key as AboutSectionKey)
                    : null

                  return (
                    <div
                      key={`${section.key}-${index}`}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                    >
                      <div className="mb-2.5 flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/45">
                          {isAbout && aboutKey
                            ? t(`admin.websiteContent.contentPages.aboutKeys.${aboutKey}`)
                            : t('admin.websiteContent.contentPages.sectionLabel', {
                                number: index + 1,
                              })}
                        </p>
                        {!isAbout ? (
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={saving || index === 0}
                              onClick={() => moveSection(index, -1)}
                              className={cn(
                                'rounded-md p-1.5 text-white/45 hover:bg-white/5 hover:text-white disabled:opacity-30',
                                focusRingClasses,
                              )}
                              aria-label={t('admin.websiteContent.contentPages.moveUp')}
                            >
                              <ArrowUp size={14} aria-hidden />
                            </button>
                            <button
                              type="button"
                              disabled={saving || index === page.sections.length - 1}
                              onClick={() => moveSection(index, 1)}
                              className={cn(
                                'rounded-md p-1.5 text-white/45 hover:bg-white/5 hover:text-white disabled:opacity-30',
                                focusRingClasses,
                              )}
                              aria-label={t('admin.websiteContent.contentPages.moveDown')}
                            >
                              <ArrowDown size={14} aria-hidden />
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => removeSection(index)}
                              className={cn(
                                'rounded-md p-1.5 text-white/45 hover:bg-white/5 hover:text-support-error',
                                focusRingClasses,
                              )}
                              aria-label={t(
                                'admin.websiteContent.contentPages.removeSection',
                              )}
                            >
                              <Trash2 size={14} aria-hidden />
                            </button>
                          </div>
                        ) : null}
                      </div>

                      <div className="space-y-2.5">
                        <div>
                          <label
                            className={labelClass}
                            htmlFor={`${formId}-section-title-${index}`}
                          >
                            {t('admin.websiteContent.contentPages.sectionTitle')}
                          </label>
                          <input
                            id={`${formId}-section-title-${index}`}
                            type="text"
                            value={section.title}
                            disabled={saving}
                            onChange={(event) =>
                              setSectionField(index, 'title', event.target.value)
                            }
                            className={fieldClass}
                          />
                        </div>

                        {isAbout &&
                        (aboutKey === 'intro' ||
                          aboutKey === 'quality' ||
                          aboutKey === 'medical') ? (
                          <div>
                            <label
                              className={labelClass}
                              htmlFor={`${formId}-section-subtitle-${index}`}
                            >
                              {aboutKey === 'intro'
                                ? t('admin.websiteContent.contentPages.sectionEyebrow')
                                : t('admin.websiteContent.contentPages.sectionSubtitle')}
                            </label>
                            <input
                              id={`${formId}-section-subtitle-${index}`}
                              type="text"
                              value={section.subtitle}
                              disabled={saving}
                              onChange={(event) =>
                                setSectionField(index, 'subtitle', event.target.value)
                              }
                              className={fieldClass}
                            />
                          </div>
                        ) : null}

                        {(aboutKey === 'intro' || aboutKey === 'authenticity' || !isAbout) && (
                          <div>
                            <label
                              className={labelClass}
                              htmlFor={`${formId}-section-body-${index}`}
                            >
                              {aboutKey === 'authenticity'
                                ? t('admin.websiteContent.contentPages.sectionDescription')
                                : t('admin.websiteContent.contentPages.sectionBody')}
                            </label>
                            <textarea
                              id={`${formId}-section-body-${index}`}
                              value={section.body}
                              disabled={saving}
                              rows={isAbout ? 3 : 2}
                              onChange={(event) =>
                                setSectionField(index, 'body', event.target.value)
                              }
                              className={cn(fieldClass, 'resize-y')}
                            />
                          </div>
                        )}

                        {isAbout && section.items.length > 0 ? (
                          <div className="grid gap-2 sm:grid-cols-2">
                            {section.items.map((item, itemIndex) => (
                              <div
                                key={`${section.key}-item-${itemIndex}`}
                                className="space-y-2 rounded-lg border border-white/10 bg-black/10 p-2.5"
                              >
                                <p className="text-[10px] uppercase tracking-wide text-white/35">
                                  {t('admin.websiteContent.contentPages.itemSlot', {
                                    number: itemIndex + 1,
                                  })}
                                </p>
                                <input
                                  type="text"
                                  value={item.title}
                                  disabled={saving}
                                  placeholder={t(
                                    'admin.websiteContent.contentPages.itemTitle',
                                  )}
                                  onChange={(event) =>
                                    setSectionItemField(
                                      index,
                                      itemIndex,
                                      'title',
                                      event.target.value,
                                    )
                                  }
                                  className={fieldClass}
                                />
                                <textarea
                                  value={item.description}
                                  disabled={saving}
                                  rows={2}
                                  placeholder={t(
                                    'admin.websiteContent.contentPages.itemDescription',
                                  )}
                                  onChange={(event) =>
                                    setSectionItemField(
                                      index,
                                      itemIndex,
                                      'description',
                                      event.target.value,
                                    )
                                  }
                                  className={cn(fieldClass, 'resize-y')}
                                />
                              </div>
                            ))}
                          </div>
                        ) : null}

                        {aboutKey === 'authenticity' ? (
                          <div>
                            <label
                              className={labelClass}
                              htmlFor={`${formId}-section-btn-${index}`}
                            >
                              {t('admin.websiteContent.contentPages.buttonLabel')}
                            </label>
                            <input
                              id={`${formId}-section-btn-${index}`}
                              type="text"
                              value={section.buttonLabel}
                              disabled={saving}
                              onChange={(event) =>
                                setSectionField(index, 'buttonLabel', event.target.value)
                              }
                              className={fieldClass}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )
                })
              )}

              <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={page.isPublished}
                  disabled={saving}
                  onChange={(event) => setField('isPublished', event.target.checked)}
                  className="size-4 rounded border-white/20 bg-white/5 accent-accent"
                />
                <span className="text-sm text-white/80">
                  {t('admin.websiteContent.contentPages.isPublished')}
                </span>
              </label>

              {error ? (
                <p className="text-sm text-support-error" role="alert">
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={saving || !canUpdate}
                className="w-full justify-center"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden />
                    {t('admin.websiteContent.contentPages.saving')}
                  </>
                ) : (
                  t('admin.websiteContent.contentPages.save')
                )}
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </GlassCard>
  )
}
