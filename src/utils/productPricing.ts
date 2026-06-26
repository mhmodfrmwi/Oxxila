interface ProductPricingSource {
  price: number
  priceAfterDiscount: number | null | undefined
}

export function resolveProductPricing(source: ProductPricingSource) {
  const hasDiscount =
    source.priceAfterDiscount != null && source.priceAfterDiscount < source.price

  return {
    hasDiscount,
    price: hasDiscount ? source.priceAfterDiscount! : source.price,
    originalPrice: hasDiscount ? source.price : undefined,
  }
}

export function resolveDiscountPercent(
  price: number,
  priceAfterDiscount: number | null | undefined,
): number | undefined {
  if (priceAfterDiscount == null || priceAfterDiscount >= price) return undefined
  return Math.round((1 - priceAfterDiscount / price) * 100)
}
