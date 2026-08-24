// src/utils/aboutCopy.ts
import type { ApiContentPage, ApiContentPageSection } from '../api/settings'
import { plainTextParagraphs } from './contentPage'

export interface AboutTextItem {
  title: string
  description: string
}

export function findAboutSection(
  page: ApiContentPage | null | undefined,
  key: string,
): ApiContentPageSection | null {
  return page?.sections?.find((section) => section.key === key) ?? null
}

export function aboutSectionCopy(section: ApiContentPageSection | null) {
  if (!section) return null
  const paragraphs = plainTextParagraphs(section.body)
  const items: AboutTextItem[] = (section.items ?? [])
    .map((item) => ({
      title: item.title?.trim() || '',
      description: item.description?.trim() || '',
    }))
    .filter((item) => item.title || item.description)

  return {
    title: section.title?.trim() || '',
    subtitle: section.subtitle?.trim() || '',
    paragraphs,
    items,
    buttonLabel: section.buttonLabel?.trim() || '',
  }
}
