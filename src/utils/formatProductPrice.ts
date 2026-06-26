export function formatProductPrice(value: number) {
  return value % 1 === 0 ? `$${value}` : `$${value.toFixed(2)}`
}
