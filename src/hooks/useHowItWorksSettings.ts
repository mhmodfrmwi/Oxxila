// src/hooks/useHowItWorksSettings.ts
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getHowItWorksSettings,
  type ApiHowItWorksSettings,
} from '../api/settings'
import { howItWorksThumb } from '../components/landing/landingData'

export interface HowItWorksStepView {
  id: string
  title: string
  description: string
}

export interface HowItWorksView {
  title: string
  thumbnailImage: string
  videoUrl: string
  steps: HowItWorksStepView[]
}

const FALLBACK_STEP_IDS = ['concern', 'explanations', 'checkout'] as const

function buildI18nFallback(
  t: (key: string) => string,
): HowItWorksView {
  return {
    title: t('home.howItWorks.title'),
    thumbnailImage: howItWorksThumb,
    videoUrl: '',
    steps: FALLBACK_STEP_IDS.map((id) => ({
      id,
      title: t(`home.howItWorks.steps.${id}.title`),
      description: t(`home.howItWorks.steps.${id}.description`),
    })),
  }
}

function mapApiToView(
  data: ApiHowItWorksSettings,
  fallback: HowItWorksView,
): HowItWorksView {
  const steps =
    data.steps?.length > 0
      ? data.steps.map((step, index) => {
          const fallbackStep = fallback.steps[index]
          return {
            id: String(step.index ?? index),
            title: step.title?.trim() || fallbackStep?.title || '',
            description: step.description?.trim() || fallbackStep?.description || '',
          }
        })
      : fallback.steps

  return {
    title: data.title?.trim() || fallback.title,
    thumbnailImage: data.thumbnailImage?.trim() || fallback.thumbnailImage,
    videoUrl: data.videoUrl?.trim() || '',
    steps,
  }
}

export function useHowItWorksSettings() {
  const { t } = useTranslation()
  const [data, setData] = useState<HowItWorksView>(() => buildI18nFallback(t))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const response = await getHowItWorksSettings()
        if (cancelled || !response.data) return
        setData(mapApiToView(response.data, buildI18nFallback(t)))
      } catch {
        if (!cancelled) setData(buildI18nFallback(t))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [t])

  return { data, loading }
}
