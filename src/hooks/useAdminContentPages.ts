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

export interface ContentPageSectionForm {
  key: string
  title: string
  body: string
  image: string
  imageFile: File | null
  previewUrl: string | null
}

export interface ContentPageForm {
  slug: ContentPageSlug
  title: string
  subtitle: string
  content: string
  isPublished: boolean
  sections: ContentPageSectionForm[]
}

function toSectionForm(section: {
  key: string
  title: string
  body: string
  image: string
}): ContentPageSectionForm {
  const image = section.image ?? ''
  return {
    key: section.key ?? '',
    title: section.title ?? '',
    body: section.body ?? '',
    image,
    imageFile: null,
    previewUrl: image.trim() || null,
  }
}

function toForm(data: ApiContentPage): ContentPageForm {
  return {
    slug: data.slug,
    title: data.title ?? '',
    subtitle: data.subtitle ?? '',
    content: data.content ?? '',
    isPublished: Boolean(data.isPublished),
    sections: (data.sections ?? []).map(toSectionForm),
  }
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
    (field: 'title' | 'subtitle' | 'content' | 'isPublished', value: string | boolean) => {
      setPage((prev) => (prev ? { ...prev, [field]: value } : prev))
    },
    [],
  )

  const setSectionField = useCallback(
    (
      index: number,
      field: 'key' | 'title' | 'body' | 'image',
      value: string,
    ) => {
      setPage((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          sections: prev.sections.map((section, sectionIndex) =>
            sectionIndex === index
              ? {
                  ...section,
                  [field]: value,
                  ...(field === 'image'
                    ? { previewUrl: value.trim() || section.previewUrl, imageFile: null }
                    : {}),
                }
              : section,
          ),
        }
      })
    },
    [],
  )

  const setSectionImageFile = useCallback((index: number, file: File | null) => {
    setPage((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        sections: prev.sections.map((section, sectionIndex) => {
          if (sectionIndex !== index) return section
          const previewUrl = file ? URL.createObjectURL(file) : section.image.trim() || null
          return { ...section, imageFile: file, previewUrl }
        }),
      }
    })
  }, [])

  const addSection = useCallback(() => {
    setPage((prev) => {
      if (!prev) return prev
      const nextIndex = prev.sections.length + 1
      return {
        ...prev,
        sections: [
          ...prev.sections,
          {
            key: `section-${nextIndex}`,
            title: '',
            body: '',
            image: '',
            imageFile: null,
            previewUrl: null,
          },
        ],
      }
    })
  }, [])

  const removeSection = useCallback((index: number) => {
    setPage((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        sections: prev.sections.filter((_, sectionIndex) => sectionIndex !== index),
      }
    })
  }, [])

  const save = useCallback(async () => {
    if (!page) return

    setSaving(true)
    setError(null)
    try {
      const sectionWithUpload = page.sections.find((section) => section.imageFile)
      const payload =
        page.slug === 'about'
          ? {
              sections: page.sections.map(({ key, title, body, image }) => ({
                key: key.trim(),
                title: title.trim(),
                body,
                image: image.trim(),
              })),
            }
          : {
              title: page.title.trim(),
              content: page.content,
              isPublished: page.isPublished,
            }

      const response = await updateContentPage(
        page.slug,
        payload,
        sectionWithUpload?.imageFile
          ? { file: sectionWithUpload.imageFile, sectionKey: sectionWithUpload.key.trim() }
          : undefined,
      )

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

  const slugs = CONTENT_PAGE_SLUGS

  return {
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
    reloadList: loadList,
    reloadPage: () => loadPage(selectedSlug),
  }
}
