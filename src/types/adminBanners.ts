// src/types/adminBanners.ts

export type AdminBannerLinkType = 'none' | 'product' | 'category' | 'url'

/** Raw banner from admin GET /banners?includeInactive=true (and create/update responses). */
export interface ApiAdminBanner {
  id: string
  image: string
  title?: string | null
  linkType: AdminBannerLinkType
  linkId?: string | null
  externalUrl?: string | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

/** Normalized row for the Banners Manager card. */
export interface AdminBannerRow {
  id: string
  image: string
  title: string
  linkType: AdminBannerLinkType
  linkId: string | null
  externalUrl: string | null
  isActive: boolean
}

/** Drawer form values (string inputs for controlled fields). */
export interface AdminBannerFormValues {
  title: string
  linkType: AdminBannerLinkType
  linkId: string
  externalUrl: string
  isActive: boolean
}

export type AdminBannerFormErrors = Partial<
  Record<keyof AdminBannerFormValues | 'image', string>
>

/** Fields sent alongside the image in the multipart request. */
export interface AdminBannerWriteFields {
  title: string
  linkType: AdminBannerLinkType
  linkId: string | null
  externalUrl: string | null
  isActive?: boolean
}
