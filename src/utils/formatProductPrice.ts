export function formatProductPrice(value: number) {
  return value % 1 === 0 ? `$${value}` : `$${value.toFixed(2)}`
}

/** Product detail card — Figma suffix style: `232.56$` */
export function formatProductPriceDetail(value: number) {
  const amount = value % 1 === 0 ? `${value}` : value.toFixed(2)
  return `${amount}$`
}
