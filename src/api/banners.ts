// src/api/banners.ts
import { apiRequest } from '../lib/api'

export type BannerLinkType = 'product' | 'category' | 'url' | 'none'

export interface ApiBanner {
  id: string
  image: string
  linkType: BannerLinkType
  title?: string | null
  linkId?: string | null
  externalUrl?: string | null
}

export function getBanners() {
  return apiRequest<ApiBanner[]>('/banners')
}
