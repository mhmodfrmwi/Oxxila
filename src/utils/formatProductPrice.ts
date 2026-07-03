export function formatProductPrice(value: number) {
  return value % 1 === 0 ? `$${value}` : `$${value.toFixed(2)}`
}

/** Product detail card — Figma suffix style: `232.56$` */
export function formatProductPriceDetail(value: number) {
  const amount = value % 1 === 0 ? `${value}` : value.toFixed(2)
  return `${amount}$`
}

/** Cart page — Figma style: `$ 252.5` / `$ 210.0` */
export function formatCartPrice(value: number) {
  const amount =
    value % 1 === 0 ? value.toFixed(1) : (value * 10) % 1 === 0 ? value.toFixed(1) : value.toFixed(2)
  return `$ ${amount}`
}
