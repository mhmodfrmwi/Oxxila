/** Shortest signed distance between slide indices on a circular carousel. */
export function getWrappedOffset(
  index: number,
  activeIndex: number,
  total: number,
): number {
  let diff = index - activeIndex
  if (diff > total / 2) diff -= total
  if (diff < -total / 2) diff += total
  return diff
}
