// src/hooks/useAdminContentPages.ts
import { useCallback, useEffect, useState } from 'react'
import {
  CONTENT_PAGE_SLUGS,
  getContentPage,
  listContentPages,
  updateContentPage,
  type ApiContentPage,
  type ApiContentPageListItem,
  type ContentPageSlug,
} from '../api/settings'
import { ABOUT_CONTENT_DEFAULTS } from '../data/aboutContentDefaults'

export const ABOUT_SECTION_KEYS = [
  'intro',
  'quality',
  'medical',
  'infrastructure',
  'authenticity',
] as const

export type AboutSectionKey = (typeof ABOUT_SECTION_KEYS)[number]

export const ABOUT_ITEM_SLOTS: Record<AboutSectionKey, number> = {
  intro: 2,
  quality: 3,
  medical: 3,
  infrastructure: 3,
  authenticity: 0,
}

export interface ContentPageSectionItemForm {
  title: string
  description: string
}

export interface ContentPageSectionForm {
  key: string
  title: string
  subtitle: string
  body: string
  items: ContentPageSectionItemForm[]
  buttonLabel: string
}

export interface ContentPageForm {
  slug: ContentPageSlug
  title: string
  subtitle: string
  isPublished: boolean
  sections: ContentPageSectionForm[]
}

function ensureAboutSections(
  sections: ApiContentPage['sections'] | undefined,
): ContentPageSectionForm[] {
  return ABOUT_SECTION_KEYS.map((key) => {
    const existing = sections?.find((section) => section.key === key)
    const defaults = ABOUT_CONTENT_DEFAULTS.sections.find((section) => section.key === key)
    const slotCount = ABOUT_ITEM_SLOTS[key]

    const items = Array.from({ length: slotCount }, (_, index) => {
      const fromApi = existing?.items?.[index]
      const fromDefault = defaults?.items?.[index]
      return {
        title: fromApi?.title?.trim() || fromDefault?.title || '',
        description: fromApi?.description?.trim() || fromDefault?.description || '',
      }
    })

    return {
      key,
      title: existing?.title?.trim() || defaults?.title || '',
      subtitle: existing?.subtitle?.trim() || defaults?.subtitle || '',
      body: existing?.body?.trim() || defaults?.body || '',
      items,
      buttonLabel: existing?.buttonLabel?.trim() || defaults?.buttonLabel || '',
    }
  })
}

function toPolicySections(
  sections: ApiContentPage['sections'] | undefined,
): ContentPageSectionForm[] {
  return (sections ?? []).map((section, index) => ({
    key: section.key || `section-${index + 1}`,
    title: section.title ?? '',
    subtitle: '',
    body: section.body ?? '',
    items: [],
    buttonLabel: '',
  }))
}

function toForm(data: ApiContentPage): ContentPageForm {
  const isAbout = data.slug === 'about'
  return {
    slug: data.slug,
    title: data.title?.trim() || (isAbout ? ABOUT_CONTENT_DEFAULTS.title : ''),
    subtitle: data.subtitle?.trim() || (isAbout ? ABOUT_CONTENT_DEFAULTS.subtitle : ''),
    isPublished: Boolean(data.isPublished),
    sections: isAbout ? ensureAboutSections(data.sections) : toPolicySections(data.sections),
  }
}

function slugifyKey(value: string, fallback: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  return slug || fallback
}

export function useAdminContentPages() {
  const [pages, setPages] = useState<ApiContentPageListItem[]>([])
  const [selectedSlug, setSelectedSlug] = useState<ContentPageSlug>('about')
  const [page, setPage] = useState<ContentPageForm | null>(null)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingPage, setLoadingPage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadList = useCallback(async () => {
    setLoadingList(true)
    setError(null)
    try {
      const response = await listContentPages(true)
      if (response.data) setPages(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load content pages.')
    } finally {
      setLoadingList(false)
    }
  }, [])

  const loadPage = useCallback(async (slug: ContentPageSlug) => {
    setLoadingPage(true)
    setError(null)
    try {
      const response = await getContentPage(slug, true)
      if (response.data) setPage(toForm(response.data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load content page.')
      setPage(null)
    } finally {
      setLoadingPage(false)
    }
  }, [])

  useEffect(() => {
    void loadList()
  }, [loadList])

  useEffect(() => {
    void loadPage(selectedSlug)
  }, [loadPage, selectedSlug])

  const selectSlug = useCallback((slug: ContentPageSlug) => {
    setSelectedSlug(slug)
  }, [])

  const setField = useCallback(
    (field: 'title' | 'subtitle' | 'isPublished', value: string | boolean) => {
      setPage((prev) => (prev ? { ...prev, [field]: value } : prev))
    },
    [],
  )

  const setSectionField = useCallback(
    (index: number, field: 'title' | 'subtitle' | 'body' | 'buttonLabel', value: string) => {
      setPage((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          sections: prev.sections.map((section, sectionIndex) =>
            sectionIndex === index ? { ...section, [field]: value } : section,
          ),
        }
      })
    },
    [],
  )

  const setSectionItemField = useCallback(
    (
      sectionIndex: number,
      itemIndex: number,
      field: 'title' | 'description',
      value: string,
    ) => {
      setPage((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          sections: prev.sections.map((section, index) => {
            if (index !== sectionIndex) return section
            return {
              ...section,
              items: section.items.map((item, i) =>
                i === itemIndex ? { ...item, [field]: value } : item,
              ),
            }
          }),
        }
      })
    },
    [],
  )

  const addSection = useCallback(() => {
    setPage((prev) => {
      if (!prev || prev.slug === 'about') return prev
      const nextIndex = prev.sections.length + 1
      return {
        ...prev,
        sections: [
          ...prev.sections,
          {
            key: `section-${nextIndex}`,
            title: '',
            subtitle: '',
            body: '',
            items: [],
            buttonLabel: '',
          },
        ],
      }
    })
  }, [])

  const removeSection = useCallback((index: number) => {
    setPage((prev) => {
      if (!prev || prev.slug === 'about') return prev
      return {
        ...prev,
        sections: prev.sections.filter((_, sectionIndex) => sectionIndex !== index),
      }
    })
  }, [])

  const moveSection = useCallback((index: number, direction: -1 | 1) => {
    setPage((prev) => {
      if (!prev || prev.slug === 'about') return prev
      const target = index + direction
      if (target < 0 || target >= prev.sections.length) return prev
      const sections = [...prev.sections]
      const [item] = sections.splice(index, 1)
      sections.splice(target, 0, item)
      return { ...prev, sections }
    })
  }, [])

  const save = useCallback(async () => {
    if (!page) return

    setSaving(true)
    setError(null)
    try {
      const payload = {
        title: page.title.trim(),
        subtitle: page.subtitle.trim(),
        isPublished: page.isPublished,
        sections: page.sections.map((section, index) => ({
          key:
            page.slug === 'about'
              ? section.key
              : slugifyKey(section.title, `section-${index + 1}`),
          title: section.title.trim(),
          subtitle: section.subtitle.trim(),
          body: section.body,
          items: section.items.map((item) => ({
            title: item.title.trim(),
            description: item.description.trim(),
          })),
          buttonLabel: section.buttonLabel.trim(),
        })),
      }

      const response = await updateContentPage(page.slug, payload)

      if (response.data) {
        setPage(toForm(response.data))
        void loadList()
      }
      return response.data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save content page.'
      setError(message)
      throw err
    } finally {
      setSaving(false)
    }
  }, [loadList, page])

  return {
    pages,
    slugs: CONTENT_PAGE_SLUGS,
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
    reloadList: loadList,
    reloadPage: () => loadPage(selectedSlug),
  }
}
