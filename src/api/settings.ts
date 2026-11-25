// src/api/settings.ts
import { apiRequest } from '../lib/api'

export interface ApiContactSettings {
  phone: string
  email: string
  location: string
  whatsapp: string
  whatsappDialCode: string
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
  titleEn?: string
  titleAr?: string
  description: string
  descriptionEn?: string
  descriptionAr?: string
}

export interface ApiHowItWorksSettings {
  title: string
  titleEn?: string
  titleAr?: string
  thumbnailImage: string
  videoUrl: string
  steps: ApiHowItWorksStep[]
}

export interface ApiUtilityBarPromo {
  index?: number
  title: string
  titleEn?: string
  titleAr?: string
  subtitle: string
  subtitleEn?: string
  subtitleAr?: string
}

export interface ApiUtilityBarSettings {
  promos: ApiUtilityBarPromo[]
  rotateIntervalSeconds: number
}

export const UTILITY_BAR_MAX_PROMOS = 8

export const INSTAGRAM_SLOT_COUNT = 4

export function getContactSettings() {
  return apiRequest<ApiContactSettings>('/settings/contact')
}

export function sendContactMessage(body: {
  name: string
  email: string
  message: string
}) {
  return apiRequest<null>('/settings/contact/message', {
    method: 'POST',
    body,
  })
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
    titleEn?: string
    titleAr?: string
    videoUrl?: string
    thumbnailImage?: string
    steps?: Array<{
      title?: string
      titleEn?: string
      titleAr?: string
      description?: string
      descriptionEn?: string
      descriptionAr?: string
    }>
  },
  thumbnailFile?: File | null,
) {
  if (thumbnailFile) {
    const body = new FormData()
    if (payload.titleEn !== undefined) body.append('titleEn', payload.titleEn)
    else if (payload.title !== undefined) body.append('title', payload.title)
    if (payload.titleAr !== undefined) body.append('titleAr', payload.titleAr)
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

export function getUtilityBarSettings() {
  return apiRequest<ApiUtilityBarSettings>('/settings/utility-bar')
}

export function updateUtilityBarSettings(body: Partial<ApiUtilityBarSettings>) {
  return apiRequest<ApiUtilityBarSettings>('/settings/utility-bar', {
    method: 'PUT',
    auth: true,
    body,
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

export interface ApiContentPageSectionItem {
  title: string
  description: string
}

export interface ApiContentPageSection {
  key: string
  title: string
  subtitle: string
  body: string
  items: ApiContentPageSectionItem[]
  buttonLabel: string
}

export interface ApiContentPageListItem {
  slug: ContentPageSlug
  title: string
  subtitle: string
  isPublished: boolean
  updatedAt?: string
}

export interface ApiContentPage extends ApiContentPageListItem {
  sections: ApiContentPageSection[]
}

export type ContentPageSectionPayload = {
  key: string
  title: string
  subtitle?: string
  body: string
  items?: ApiContentPageSectionItem[]
  buttonLabel?: string
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
    isPublished?: boolean
    sections?: ContentPageSectionPayload[]
  },
) {
  return apiRequest<ApiContentPage>(`/settings/pages/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    auth: true,
    body: payload,
  })
}

export interface ApiDeliverySettings {
  messageEn: string
  messageAr: string
  minDays: number
  maxDays: number
}

/** General delivery-time note (public) — shown on confirmation/tracking; editable in the dashboard. */
export function getDeliverySettings() {
  return apiRequest<ApiDeliverySettings>('/settings/delivery')
}

export function updateDeliverySettings(body: Partial<ApiDeliverySettings>) {
  return apiRequest<ApiDeliverySettings>('/settings/delivery', {
    method: 'PUT',
    auth: true,
    body,
  })
}
