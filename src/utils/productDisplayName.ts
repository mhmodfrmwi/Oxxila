// src/utils/productDisplayName.ts

/** Remove a duplicated brand prefix so cards don't read "Brand Brand Product…". */
export function stripLeadingBrandFromName(brand: string, productName: string): string {
  const name = productName.trim()
  const brandName = brand.trim()
  if (!name || !brandName) return name

  const lowerName = name.toLowerCase()
  const lowerBrand = brandName.toLowerCase()

  if (lowerName.startsWith(lowerBrand)) {
    const rest = name.slice(brandName.length).replace(/^[\s\-–—:|]+/, '').trim()
    if (rest) return rest
  }

  const brandFirstWord = brandName.split(/\s+/)[0]?.trim()
  if (brandFirstWord && brandFirstWord.length > 1) {
    const lowerFirst = brandFirstWord.toLowerCase()
    if (lowerName.startsWith(lowerFirst)) {
      const rest = name.slice(brandFirstWord.length).replace(/^[\s\-–—:|]+/, '').trim()
      if (rest) return rest
    }
  }

  return name
}
