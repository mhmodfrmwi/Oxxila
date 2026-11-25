// src/hooks/useHorizontalWheel.ts
import { useCallback, useRef, type WheelEvent } from 'react'

const WHEEL_THRESHOLD = 30
/** Trackpad momentum keeps firing wheel events; the lock lasts until they stop so one swipe = one step. */
const GESTURE_IDLE_MS = 220

export function useHorizontalWheel({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const accumulatedRef = useRef(0)
  const lockedUntilRef = useRef(0)

  return useCallback(
    (event: WheelEvent<HTMLElement>) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return

      const now = event.timeStamp
      if (now < lockedUntilRef.current) {
        lockedUntilRef.current = now + GESTURE_IDLE_MS
        return
      }

      accumulatedRef.current += event.deltaX
      if (Math.abs(accumulatedRef.current) < WHEEL_THRESHOLD) return

      if (accumulatedRef.current > 0) onNext()
      else onPrev()
      accumulatedRef.current = 0
      lockedUntilRef.current = now + GESTURE_IDLE_MS
    },
    [onNext, onPrev],
  )
}
