export function formatReviewCount(count: number) {
  if (count >= 1000) {
    const value = count / 1000
    return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}k`
  }
  return String(count)
}
