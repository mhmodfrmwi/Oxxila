// src/components/admin/website-content/ContentPagesCard.tsx
import { FileText, Loader2, Plus, Trash2 } from 'lucide-react'
import { useId, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../context/ToastContext'
import { useAdminContentPages } from '../../../hooks/useAdminContentPages'
import { useAdminPermissions } from '../../../hooks/useAdminPermissions'
import { cn } from '../../../lib/cn'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'

const fieldClass = cn(
  'w-full rounded-xl border border-white/10 bg-white/5 px-[13.6px] py-[10.4px]',
  'text-sm text-white placeholder:text-white/40',
  focusRingClasses,
)

const labelClass = 'text-xs font-semibold uppercase tracking-[0.08em] text-white/70'

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
    setSectionImageFile,
    addSection,
    removeSection,
    save,
    reloadList,
    reloadPage,
  } = useAdminContentPages()

  const isAbout = selectedSlug === 'about'
  const listItem = pages.find((item) => item.slug === selectedSlug)

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
      <div className="mb-5 flex items-start gap-3">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#a394ff]">
          <FileText size={20} aria-hidden />
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

      <div className="flex flex-col gap-5 lg:flex-row">
        <nav
          className="flex shrink-0 flex-row gap-2 overflow-x-auto lg:w-52 lg:flex-col lg:overflow-visible"
          aria-label={t('admin.websiteContent.contentPages.navAria')}
        >
          {loadingList
            ? slugs.map((slug) => (
                <Skeleton key={slug} className="h-11 w-full rounded-xl" />
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
                      'rounded-xl border px-3 py-2.5 text-start text-sm transition-colors',
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
            <div className="space-y-4" aria-hidden>
              {[0, 1, 2].map((index) => (
                <Skeleton key={index} className="h-24 w-full rounded-xl" />
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
              className="space-y-4"
              onSubmit={(event) => void handleSubmit(event)}
              noValidate
            >
              {isAbout ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className={labelClass}>
                      {t('admin.websiteContent.contentPages.sectionsHeading')}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={saving}
                      onClick={addSection}
                      className="min-h-9 px-4 py-2 text-xs"
                    >
                      <Plus size={14} aria-hidden />
                      {t('admin.websiteContent.contentPages.addSection')}
                    </Button>
                  </div>

                  {page.sections.length === 0 ? (
                    <p className="text-sm text-white/45">
                      {t('admin.websiteContent.contentPages.noSections')}
                    </p>
                  ) : (
                    page.sections.map((section, index) => (
                      <div
                        key={`${section.key}-${index}`}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/50">
                            {t('admin.websiteContent.contentPages.sectionLabel', {
                              number: index + 1,
                            })}
                          </p>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => removeSection(index)}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-white/50 hover:bg-white/5 hover:text-support-error',
                              focusRingClasses,
                            )}
                            aria-label={t('admin.websiteContent.contentPages.removeSection')}
                          >
                            <Trash2 size={14} aria-hidden />
                          </button>
                        </div>

                        <div className="mb-3 aspect-[16/9] overflow-hidden rounded-xl border border-white/10 bg-white/5">
                          {section.previewUrl ? (
                            <img
                              src={section.previewUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-white/30">
                              {t('admin.websiteContent.contentPages.noImage')}
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label
                              className={labelClass}
                              htmlFor={`${formId}-section-key-${index}`}
                            >
                              {t('admin.websiteContent.contentPages.sectionKey')}
                            </label>
                            <input
                              id={`${formId}-section-key-${index}`}
                              type="text"
                              value={section.key}
                              disabled={saving}
                              onChange={(event) =>
                                setSectionField(index, 'key', event.target.value)
                              }
                              className={cn(fieldClass, 'mt-2')}
                            />
                          </div>
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
                              className={cn(fieldClass, 'mt-2')}
                            />
                          </div>
                          <div>
                            <label
                              className={labelClass}
                              htmlFor={`${formId}-section-body-${index}`}
                            >
                              {t('admin.websiteContent.contentPages.sectionBody')}
                            </label>
                            <textarea
                              id={`${formId}-section-body-${index}`}
                              value={section.body}
                              disabled={saving}
                              rows={4}
                              onChange={(event) =>
                                setSectionField(index, 'body', event.target.value)
                              }
                              className={cn(fieldClass, 'mt-2 resize-y')}
                            />
                          </div>
                          <div>
                            <label
                              className={labelClass}
                              htmlFor={`${formId}-section-image-${index}`}
                            >
                              {t('admin.websiteContent.contentPages.sectionImageUrl')}
                            </label>
                            <input
                              id={`${formId}-section-image-${index}`}
                              type="url"
                              value={section.image}
                              disabled={saving}
                              onChange={(event) =>
                                setSectionField(index, 'image', event.target.value)
                              }
                              placeholder="https://..."
                              className={cn(fieldClass, 'mt-2')}
                            />
                          </div>
                          <div>
                            <label
                              className={labelClass}
                              htmlFor={`${formId}-section-file-${index}`}
                            >
                              {t('admin.websiteContent.contentPages.sectionUpload')}
                            </label>
                            <input
                              id={`${formId}-section-file-${index}`}
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              disabled={saving}
                              onChange={(event) =>
                                setSectionImageFile(index, event.target.files?.[0] ?? null)
                              }
                              className={cn(
                                fieldClass,
                                'mt-2 file:me-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:text-white',
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              ) : (
                <>
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
                      placeholder={listItem?.title}
                      className={cn(fieldClass, 'mt-2')}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor={`${formId}-page-content`}>
                      {t('admin.websiteContent.contentPages.pageContent')}
                    </label>
                    <textarea
                      id={`${formId}-page-content`}
                      value={page.content}
                      disabled={saving}
                      rows={12}
                      onChange={(event) => setField('content', event.target.value)}
                      className={cn(fieldClass, 'mt-2 resize-y font-mono text-[13px]')}
                    />
                  </div>

                  <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
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
                </>
              )}

              {error ? (
                <p className="text-sm text-support-error" role="alert">
                  {error}
                </p>
              ) : null}

              <Button type="submit" disabled={saving || !canUpdate} className="w-full justify-center">
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
