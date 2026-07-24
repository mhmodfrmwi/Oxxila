// src/utils/adminBannersFormat.ts
import type {
  AdminBannerFormErrors,
  AdminBannerFormValues,
  AdminBannerLinkType,
  AdminBannerRow,
  AdminBannerWriteFields,
  ApiAdminBanner,
} from '../types/adminBanners'

export function mapApiBannerToRow(banner: ApiAdminBanner): AdminBannerRow {
  return {
    id: banner.id,
    image: banner.image,
    title: banner.title ?? '',
    linkType: banner.linkType ?? 'none',
    linkId: banner.linkId ?? null,
    externalUrl: banner.externalUrl ?? null,
    isActive: banner.isActive !== false,
  }
}

export function emptyBannerFormValues(): AdminBannerFormValues {
  return {
    title: '',
    linkType: 'none',
    linkId: '',
    externalUrl: '',
    isActive: true,
  }
}

export function bannerToFormValues(banner: AdminBannerRow): AdminBannerFormValues {
  return {
    title: banner.title,
    linkType: banner.linkType,
    linkId: banner.linkId ?? '',
    externalUrl: banner.externalUrl ?? '',
    isActive: banner.isActive,
  }
}

/** Client validation aligned with banner.validator.js + Banner.js pre-validate hook. */
export function validateBannerForm(
  values: AdminBannerFormValues,
  mode: 'create' | 'edit',
  hasImage: boolean,
): AdminBannerFormErrors {
  const errors: AdminBannerFormErrors = {}

  if (mode === 'create' && !hasImage) {
    errors.image = 'Image is required'
  }

  if (values.title.trim().length > 200) {
    errors.title = 'Title cannot exceed 200 characters'
  }

  if (['product', 'category'].includes(values.linkType) && !values.linkId.trim()) {
    errors.linkId = 'This field is required'
  }

  if (values.linkType === 'url' && !values.externalUrl.trim()) {
    errors.externalUrl = 'External URL is required'
  }

  return errors
}

export function formValuesToWriteFields(
  values: AdminBannerFormValues,
): AdminBannerWriteFields {
  const linkType: AdminBannerLinkType = values.linkType

  if (linkType === 'product' || linkType === 'category') {
    return {
      title: values.title.trim(),
      linkType,
      linkId: values.linkId.trim(),
      externalUrl: null,
      isActive: values.isActive,
    }
  }

  if (linkType === 'url') {
    return {
      title: values.title.trim(),
      linkType,
      linkId: null,
      externalUrl: values.externalUrl.trim(),
      isActive: values.isActive,
    }
  }

  return {
    title: values.title.trim(),
    linkType: 'none',
    linkId: null,
    externalUrl: null,
    isActive: values.isActive,
  }
}
