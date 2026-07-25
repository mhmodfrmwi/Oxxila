// src/types/adminFaqs.ts

/** Raw FAQ from /api/v1/products/:productId/faqs or /api/v1/faqs/:id. */
export interface ApiAdminFaq {
  _id: string
  question: string
  answer: string
  isActive?: boolean
  product?: string | { _id: string; name?: string }
  createdAt?: string
  updatedAt?: string
}

/** Normalized row for FAQs Manager table. */
export interface AdminFaqRow {
  id: string
  question: string
  answer: string
  isActive: boolean
  productId: string
  productName: string | null
  updatedAt: string | null
}

export interface AdminFaqsListParams {
  productId: string
}

export interface AdminFaqWriteFields {
  question: string
  answer: string
  isActive?: boolean
}

export interface AdminFaqFormValues {
  question: string
  answer: string
  product: string
  isActive: boolean
}

export type AdminFaqFormErrors = Partial<
  Record<keyof AdminFaqFormValues, string>
>

/** Lightweight product option for FAQ filters / drawer. */
export interface AdminFaqProductOption {
  id: string
  name: string
}
