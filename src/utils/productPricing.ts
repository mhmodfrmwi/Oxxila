// src/utils/productPricing.ts
interface ProductPricingSource {
  price: number
  priceAfterDiscount: number | null | undefined
  offerEndsAt?: string | null
}

function isOfferStillLive(offerEndsAt: string | null | undefined, now = Date.now()): boolean {
  if (offerEndsAt == null) return false
  const endsAt = new Date(offerEndsAt).getTime()
  return Number.isFinite(endsAt) && endsAt > now
}

function livePriceAfterDiscount(source: ProductPricingSource): number | null {
  if (source.priceAfterDiscount == null) return null
  if (!isOfferStillLive(source.offerEndsAt)) return null
  return source.priceAfterDiscount
}

export function resolveProductPricing(source: ProductPricingSource) {
  const discounted = livePriceAfterDiscount(source)
  const hasDiscount = discounted != null && discounted < source.price

  return {
    hasDiscount,
    price: hasDiscount ? discounted! : source.price,
    originalPrice: hasDiscount ? source.price : undefined,
  }
}

export function resolveDiscountPercent(
  price: number,
  priceAfterDiscount: number | null | undefined,
  offerEndsAt?: string | null,
): number | undefined {
  if (priceAfterDiscount == null || priceAfterDiscount >= price) return undefined
  if (!isOfferStillLive(offerEndsAt)) return undefined
  return Math.round((1 - priceAfterDiscount / price) * 100)
}
