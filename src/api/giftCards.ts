// src/api/giftCards.ts
import { apiRequest } from '../lib/api'

export type GiftCardTransactionType = 'issued' | 'redeemed'

export type GiftCardTransactionSource = 'cod_return' | 'order' | 'other'

export interface ApiGiftCardTransaction {
  id: string
  type: GiftCardTransactionType
  amount: number
  balanceAfter: number
  source: GiftCardTransactionSource
  returnRequestId: string | null
  orderId: string | null
  orderNumber: string | null
  createdAt: string
}

export interface ApiGiftCardsData {
  balance: number
  currency: string
  transactions: ApiGiftCardTransaction[]
}

/** GET /api/v1/gift-cards — store credit balance + ledger (COD return refunds). */
export function getMyGiftCards(options?: { signal?: AbortSignal }) {
  return apiRequest<ApiGiftCardsData>('/gift-cards', {
    auth: true,
    signal: options?.signal,
  })
}
