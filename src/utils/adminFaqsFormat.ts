// src/utils/adminFaqsFormat.ts
import type {
  AdminFaqFormErrors,
  AdminFaqFormValues,
  AdminFaqRow,
  AdminFaqWriteFields,
  ApiAdminFaq,
} from '../types/adminFaqs'

export const ADMIN_FAQ_QUESTION_MAX = 300
export const ADMIN_FAQ_ANSWER_MAX = 1000
export const ADMIN_FAQ_ANSWER_PREVIEW_MAX = 120

function resolveProduct(
  product: ApiAdminFaq['product'],
): { id: string; name: string | null } {
  if (product && typeof product === 'object') {
    return {
      id: product._id ? String(product._id) : '',
      name: product.name ?? null,
    }
  }
  if (typeof product === 'string' && product) {
    return { id: product, name: null }
  }
  return { id: '', name: null }
}

export function mapApiFaqToAdminRow(
  faq: ApiAdminFaq,
  fallbackProduct?: { id: string; name: string | null },
): AdminFaqRow {
  const resolved = resolveProduct(faq.product)

  return {
    id: String(faq._id),
    question: faq.question ?? '',
    answer: faq.answer ?? '',
    isActive: faq.isActive !== false,
    productId: resolved.id || fallbackProduct?.id || '',
    productName: resolved.name ?? fallbackProduct?.name ?? null,
    updatedAt: faq.updatedAt ?? faq.createdAt ?? null,
  }
}

export function truncateFaqAnswer(
  answer: string,
  max = ADMIN_FAQ_ANSWER_PREVIEW_MAX,
): string {
  const trimmed = answer.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max).trimEnd()}…`
}

export function emptyFaqFormValues(
  productId = '',
): AdminFaqFormValues {
  return {
    question: '',
    answer: '',
    product: productId,
    isActive: true,
  }
}

export function faqToFormValues(faq: AdminFaqRow): AdminFaqFormValues {
  return {
    question: faq.question,
    answer: faq.answer,
    product: faq.productId,
    isActive: faq.isActive,
  }
}

export function formValuesToWriteFields(
  values: AdminFaqFormValues,
): AdminFaqWriteFields {
  return {
    question: values.question.trim(),
    answer: values.answer.trim(),
    isActive: values.isActive,
  }
}

/** Client validation aligned with faq.validator.js. */
export function validateFaqForm(
  values: AdminFaqFormValues,
  options?: { requireProduct?: boolean },
): AdminFaqFormErrors {
  const errors: AdminFaqFormErrors = {}
  const question = values.question.trim()
  const answer = values.answer.trim()
  const requireProduct = options?.requireProduct ?? true

  if (!question) {
    errors.question = 'Question is required'
  } else if (question.length > ADMIN_FAQ_QUESTION_MAX) {
    errors.question = `Question cannot exceed ${ADMIN_FAQ_QUESTION_MAX} characters`
  }

  if (!answer) {
    errors.answer = 'Answer is required'
  } else if (answer.length > ADMIN_FAQ_ANSWER_MAX) {
    errors.answer = `Answer cannot exceed ${ADMIN_FAQ_ANSWER_MAX} characters`
  }

  if (requireProduct && !values.product.trim()) {
    errors.product = 'Product is required'
  }

  return errors
}
