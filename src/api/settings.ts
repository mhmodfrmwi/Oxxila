// src/api/settings.ts
import { apiRequest } from '../lib/api'

export interface ApiContactSettings {
  phone: string
  email: string
  location: string
  whatsapp: string
  whatsappUrl: string
}

export interface ApiSocialSettings {
  facebook: string
  twitter: string
  instagram: string
  linkedin: string
  youtube: string
}

export interface ApiInstagramPost {
  index: number
  image: string
  postUrl: string
  alt: string
}

export interface ApiHowItWorksStep {
  index: number
  title: string
  description: string
}

export interface ApiHowItWorksSettings {
  title: string
  thumbnailImage: string
  videoUrl: string
  steps: ApiHowItWorksStep[]
}

export const INSTAGRAM_SLOT_COUNT = 4

export function getContactSettings() {
  return apiRequest<ApiContactSettings>('/settings/contact')
}

export function updateContactSettings(body: Partial<ApiContactSettings>) {
  return apiRequest<ApiContactSettings>('/settings/contact', {
    method: 'PUT',
    auth: true,
    body,
  })
}

export function getSocialSettings() {
  return apiRequest<ApiSocialSettings>('/settings/social')
}

export function updateSocialSettings(body: Partial<ApiSocialSettings>) {
  return apiRequest<ApiSocialSettings>('/settings/social', {
    method: 'PUT',
    auth: true,
    body,
  })
}

export function getInstagramSettings() {
  return apiRequest<ApiInstagramPost[]>('/settings/instagram')
}

export function updateInstagramSettings(
  posts: Array<{ image?: string; postUrl?: string; alt?: string }>,
  imageFiles: Array<File | null>,
) {
  const body = new FormData()
  body.append('posts', JSON.stringify(posts))
  imageFiles.forEach((file, index) => {
    if (file) body.append(`instagramImage${index}`, file)
  })
  return apiRequest<ApiInstagramPost[]>('/settings/instagram', {
    method: 'PUT',
    auth: true,
    body,
  })
}

export function getHowItWorksSettings() {
  return apiRequest<ApiHowItWorksSettings>('/settings/how-it-works')
}

export function updateHowItWorksSettings(
  payload: {
    title?: string
    videoUrl?: string
    thumbnailImage?: string
    steps?: Array<{ title: string; description: string }>
  },
  thumbnailFile?: File | null,
) {
  if (thumbnailFile) {
    const body = new FormData()
    if (payload.title !== undefined) body.append('title', payload.title)
    if (payload.videoUrl !== undefined) body.append('videoUrl', payload.videoUrl)
    body.append('steps', JSON.stringify(payload.steps ?? []))
    body.append('thumbnailImage', thumbnailFile)
    return apiRequest<ApiHowItWorksSettings>('/settings/how-it-works', {
      method: 'PUT',
      auth: true,
      body,
    })
  }

  return apiRequest<ApiHowItWorksSettings>('/settings/how-it-works', {
    method: 'PUT',
    auth: true,
    body: payload,
  })
}

export const CONTENT_PAGE_SLUGS = [
  'about',
  'terms',
  'privacy',
  'refund-policy',
  'shipping-policy',
] as const

export type ContentPageSlug = (typeof CONTENT_PAGE_SLUGS)[number]

export interface ApiContentPageSection {
  key: string
  title: string
  body: string
  image: string
}

export interface ApiContentPageListItem {
  slug: ContentPageSlug
  title: string
  subtitle: string
  isPublished: boolean
  updatedAt?: string
}

export interface ApiContentPage extends ApiContentPageListItem {
  content: string
  sections: ApiContentPageSection[]
}

export function listContentPages(includeDrafts = false) {
  const query = includeDrafts ? '?includeDrafts=true' : ''
  return apiRequest<ApiContentPageListItem[]>(`/settings/pages${query}`, {
    auth: includeDrafts,
  })
}

export function getContentPage(slug: ContentPageSlug, auth = false) {
  return apiRequest<ApiContentPage>(`/settings/pages/${encodeURIComponent(slug)}`, {
    auth,
  })
}

export function updateContentPage(
  slug: ContentPageSlug,
  payload: {
    title?: string
    subtitle?: string
    content?: string
    isPublished?: boolean
    sections?: Array<{ key: string; title: string; body: string; image?: string }>
  },
  sectionImage?: { file: File; sectionKey: string },
) {
  if (sectionImage) {
    const body = new FormData()
    if (payload.title !== undefined) body.append('title', payload.title)
    if (payload.subtitle !== undefined) body.append('subtitle', payload.subtitle)
    if (payload.content !== undefined) body.append('content', payload.content)
    if (payload.isPublished !== undefined) {
      body.append('isPublished', String(payload.isPublished))
    }
    if (payload.sections !== undefined) {
      body.append('sections', JSON.stringify(payload.sections))
    }
    body.append('sectionKey', sectionImage.sectionKey)
    body.append('sectionImage', sectionImage.file)
    return apiRequest<ApiContentPage>(`/settings/pages/${encodeURIComponent(slug)}`, {
      method: 'PUT',
      auth: true,
      body,
    })
  }

  return apiRequest<ApiContentPage>(`/settings/pages/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    auth: true,
    body: payload,
  })
}
