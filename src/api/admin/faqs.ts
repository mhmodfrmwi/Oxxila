// src/api/admin/faqs.ts
import { apiRequest } from '../../lib/api'
import type {
  AdminFaqWriteFields,
  ApiAdminFaq,
} from '../../types/adminFaqs'

function productFaqsPath(productId: string): string {
  return `/products/${encodeURIComponent(productId)}/faqs`
}

/**
 * GET /api/v1/products/:productId/faqs
 * Active FAQs only; no pagination / keyword on the backend.
 */
export function getAdminProductFaqs(
  productId: string,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminFaq[]>(productFaqsPath(productId), {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

/** POST /api/v1/products/:productId/faqs */
export function createAdminFaq(
  productId: string,
  fields: AdminFaqWriteFields,
) {
  return apiRequest<ApiAdminFaq>(productFaqsPath(productId), {
    method: 'POST',
    auth: true,
    body: {
      question: fields.question,
      answer: fields.answer,
      ...(fields.isActive !== undefined ? { isActive: fields.isActive } : {}),
    },
  })
}

/** PUT /api/v1/faqs/:id */
export function updateAdminFaq(faqId: string, fields: Partial<AdminFaqWriteFields>) {
  const body: Record<string, unknown> = {}
  if (fields.question !== undefined) body.question = fields.question
  if (fields.answer !== undefined) body.answer = fields.answer
  if (fields.isActive !== undefined) body.isActive = fields.isActive

  return apiRequest<ApiAdminFaq>(`/faqs/${encodeURIComponent(faqId)}`, {
    method: 'PUT',
    auth: true,
    body,
  })
}

/** PUT /api/v1/faqs/:id with only `isActive`. */
export function setAdminFaqActive(faqId: string, isActive: boolean) {
  return updateAdminFaq(faqId, { isActive })
}

/** DELETE /api/v1/faqs/:id */
export function deleteAdminFaq(faqId: string) {
  return apiRequest<null>(`/faqs/${encodeURIComponent(faqId)}`, {
    method: 'DELETE',
    auth: true,
  })
}
