// src/components/promo-carousel/useCountdown.ts
import { useEffect, useState } from 'react'

export interface CountdownValues {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

function parseTargetDate(targetDate: Date | string) {
  return targetDate instanceof Date ? targetDate : new Date(targetDate)
}

export function getCountdownValues(targetDate: Date | string): CountdownValues {
  const target = parseTargetDate(targetDate)
  const remainingMs = Math.max(0, target.getTime() - Date.now())
  const isExpired = target.getTime() <= Date.now()
  const totalSeconds = Math.floor(remainingMs / 1000)

  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, isExpired }
}

export function formatCountdown({
  days,
  hours,
  minutes,
  seconds,
}: Pick<CountdownValues, 'days' | 'hours' | 'minutes' | 'seconds'>) {
  const pad = (value: number) => String(value).padStart(2, '0')
  if (days > 0) {
    return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

function getTargetKey(targetDate: Date | string) {
  return targetDate instanceof Date ? targetDate.getTime() : targetDate
}

export function useCountdown(targetDate: Date | string) {
  const [tick, setTick] = useState(0)
  const targetKey = getTargetKey(targetDate)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTick((current) => current + 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [targetKey])

  void tick
  return getCountdownValues(targetDate)
}
