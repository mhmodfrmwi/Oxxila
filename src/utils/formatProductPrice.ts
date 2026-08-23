// src/utils/formatProductPrice.ts

const CURRENCY = 'EGP'

function formatAmount(value: number, fractionDigits?: number): string {
  if (fractionDigits != null) {
    return value.toFixed(fractionDigits)
  }
  return value % 1 === 0 ? `${value}` : value.toFixed(2)
}

export function formatProductPrice(value: number) {
  return `${formatAmount(value)} ${CURRENCY}`
}

/** Product detail card — amount then currency: `232.56 EGP` */
export function formatProductPriceDetail(value: number) {
  return `${formatAmount(value)} ${CURRENCY}`
}

/** Cart / checkout — `252.5 EGP` / `210.0 EGP` */
export function formatCartPrice(value: number) {
  const amount =
    value % 1 === 0
      ? value.toFixed(1)
      : (value * 10) % 1 === 0
        ? value.toFixed(1)
        : value.toFixed(2)
  return `${amount} ${CURRENCY}`
}
