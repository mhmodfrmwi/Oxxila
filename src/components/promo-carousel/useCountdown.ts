import { useEffect, useState } from 'react'

export interface CountdownValues {
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

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isExpired,
  }
}

export function formatCountdown({ hours, minutes, seconds }: Pick<CountdownValues, 'hours' | 'minutes' | 'seconds'>) {
  const pad = (value: number) => String(value).padStart(2, '0')
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
