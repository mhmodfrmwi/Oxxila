// src/utils/adminOffersFormat.ts
import type {
  AdminOfferCreatePayload,
  AdminOfferFormErrors,
  AdminOfferFormValues,
  AdminOfferRow,
  AdminOfferUpdatePayload,
  ApiAdminOffer,
  ApiAdminOfferProduct,
} from '../types/adminOffers'
import {
  formatDashboardMoney,
  resolveDashboardLocale,
} from './adminDashboardFormat'

function toDatetimeLocal(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Figma Offers table: `03 Apr 12:00 am`. */
export function formatOfferDateTime(value: string, locale = 'en'): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(resolveDashboardLocale(locale), {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function formatOfferDiscount(
  percent: number | null | undefined,
  amount: number | null | undefined,
  locale = 'en',
): string {
  // Match BE syncProductOffer XOR: non-null percent wins — except legacy
  // rows saved with percent=0 + real amount (prior FE placeholder bug).
  const hasAmount = amount != null && Number.isFinite(amount)
  const hasPercent = percent != null && Number.isFinite(percent)
  if (hasPercent && !(percent === 0 && hasAmount && amount! > 0)) {
    return `${percent}% OFF`
  }
  if (hasAmount) {
    return `${formatDashboardMoney(amount!, locale)} Credit`
  }
  return '—'
}

export function formatOfferAmount(productCount: number | null): string {
  if (productCount == null || !Number.isFinite(productCount)) return '—'
  return String(productCount)
}

function resolveProduct(
  product: ApiAdminOffer['product'],
): { id: string; name: string } {
  if (product && typeof product === 'object') {
    return {
      id: String(product._id),
      name: product.name || '—',
    }
  }
  return {
    id: product ? String(product) : '',
    name: '—',
  }
}

export function mapApiOfferToAdminRow(
  offer: ApiAdminOffer,
  locale = 'en',
): AdminOfferRow {
  const { id: productId, name: productName } = resolveProduct(offer.product)
  const discountPercent =
    offer.discountPercent == null || !Number.isFinite(offer.discountPercent)
      ? null
      : offer.discountPercent
  const discountAmount =
    offer.discountAmount == null || !Number.isFinite(offer.discountAmount)
      ? null
      : offer.discountAmount
  const productCount =
    offer.productCount == null || !Number.isFinite(offer.productCount)
      ? null
      : offer.productCount

  return {
    id: String(offer._id),
    productId,
    productName,
    discountPercent,
    discountAmount,
    discountLabel: formatOfferDiscount(discountPercent, discountAmount, locale),
    productCount,
    amountLabel: formatOfferAmount(productCount),
    startDate: offer.startDate,
    endDate: offer.endDate,
    startLabel: formatOfferDateTime(offer.startDate, locale),
    endLabel: formatOfferDateTime(offer.endDate, locale),
    isActive: offer.isActive !== false,
  }
}

export function emptyOfferFormValues(): AdminOfferFormValues {
  return {
    product: '',
    discountMode: 'percent',
    discountValue: '',
    productCount: '',
    startDate: '',
    endDate: '',
    isActive: true,
  }
}

export function offerToFormValues(offer: ApiAdminOffer): AdminOfferFormValues {
  const product =
    offer.product && typeof offer.product === 'object'
      ? String((offer.product as ApiAdminOfferProduct)._id)
      : String(offer.product ?? '')

  const percent =
    offer.discountPercent == null || !Number.isFinite(offer.discountPercent)
      ? null
      : offer.discountPercent
  const amount =
    offer.discountAmount == null || !Number.isFinite(offer.discountAmount)
      ? null
      : offer.discountAmount

  // Amount mode when percent is null (XOR contract), or legacy percent=0 + amount.
  const isAmountMode =
    percent == null
      ? amount != null
      : percent === 0 && amount != null && amount > 0

  return {
    product,
    discountMode: isAmountMode ? 'amount' : 'percent',
    discountValue: isAmountMode
      ? amount != null
        ? String(amount)
        : ''
      : percent != null
        ? String(percent)
        : '',
    productCount:
      offer.productCount == null || offer.productCount === undefined
        ? ''
        : String(offer.productCount),
    startDate: offer.startDate ? toDatetimeLocal(offer.startDate) : '',
    endDate: offer.endDate ? toDatetimeLocal(offer.endDate) : '',
    isActive: offer.isActive !== false,
  }
}

/** Client validation aligned with offer.validator.js + model date hook. */
export function validateOfferForm(
  values: AdminOfferFormValues,
  mode: 'create' | 'edit',
): AdminOfferFormErrors {
  const errors: AdminOfferFormErrors = {}

  if (mode === 'create' || values.product) {
    if (!values.product.trim()) {
      errors.product = 'Product is required'
    } else if (!/^[a-f\d]{24}$/i.test(values.product.trim())) {
      errors.product = 'Invalid product id'
    }
  }

  const discountRaw = values.discountValue.trim()
  if (mode === 'create' || discountRaw !== '') {
    if (discountRaw === '') {
      errors.discountValue = 'Discount value is required'
    } else {
      const discountValue = Number(discountRaw)
      if (!Number.isFinite(discountValue)) {
        errors.discountValue =
          values.discountMode === 'percent'
            ? 'discountPercent must be between 0 and 100'
            : 'discountAmount must be >= 0'
      } else if (values.discountMode === 'percent') {
        if (discountValue < 0 || discountValue > 100) {
          errors.discountValue = 'discountPercent must be between 0 and 100'
        }
      } else if (discountValue < 0) {
        errors.discountValue = 'discountAmount must be >= 0'
      }
    }
  }

  const countRaw = values.productCount.trim()
  if (countRaw !== '') {
    const count = Number(countRaw)
    if (!Number.isInteger(count) || count < 1) {
      errors.productCount = 'productCount must be >= 1'
    }
  }

  const startRaw = values.startDate.trim()
  const endRaw = values.endDate.trim()

  if (mode === 'create' || startRaw !== '') {
    if (!startRaw) {
      errors.startDate = 'startDate is required'
    } else {
      const start = new Date(startRaw)
      if (Number.isNaN(start.getTime())) {
        errors.startDate = 'startDate must be a valid ISO 8601 date'
      }
    }
  }

  if (mode === 'create' || endRaw !== '') {
    if (!endRaw) {
      errors.endDate = 'endDate is required'
    } else {
      const end = new Date(endRaw)
      if (Number.isNaN(end.getTime())) {
        errors.endDate = 'endDate must be a valid ISO 8601 date'
      }
    }
  }

  if (!errors.startDate && !errors.endDate && startRaw && endRaw) {
    const start = new Date(startRaw)
    const end = new Date(endRaw)
    if (
      !Number.isNaN(start.getTime()) &&
      !Number.isNaN(end.getTime()) &&
      end <= start
    ) {
      errors.endDate = 'endDate must be after startDate'
    }
  }

  return errors
}

export function formValuesToCreatePayload(
  values: AdminOfferFormValues,
): AdminOfferCreatePayload {
  const discountValue = Number(values.discountValue)
  // BE syncProductOffer: `discountPercent != null` ⇒ percent mode.
  // Unused field must be null (never 0). Validators allow null via optional({ values: 'null' }).
  const payload: AdminOfferCreatePayload = {
    product: values.product.trim(),
    startDate: new Date(values.startDate).toISOString(),
    endDate: new Date(values.endDate).toISOString(),
    discountPercent:
      values.discountMode === 'percent' ? discountValue : null,
    discountAmount: values.discountMode === 'amount' ? discountValue : null,
  }

  const countRaw = values.productCount.trim()
  if (countRaw !== '') {
    payload.productCount = Number(countRaw)
  }

  return payload
}

export function formValuesToUpdatePayload(
  values: AdminOfferFormValues,
): AdminOfferUpdatePayload {
  return {
    ...formValuesToCreatePayload(values),
    isActive: values.isActive,
  }
}
