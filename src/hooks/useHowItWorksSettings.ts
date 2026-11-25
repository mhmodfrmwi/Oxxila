// src/hooks/useHowItWorksSettings.ts
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getHowItWorksSettings,
  type ApiHowItWorksSettings,
} from '../api/settings'
import { howItWorksThumb } from '../components/landing/landingData'
import { cmsLocaleText } from '../utils/cmsLocaleText'

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
  locale: string,
): HowItWorksView {
  const steps =
    data.steps?.length > 0
      ? data.steps.map((step, index) => {
          const fallbackStep = fallback.steps[index]
          return {
            id: String(step.index ?? index),
            title:
              cmsLocaleText(
                {
                  en: step.titleEn,
                  ar: step.titleAr,
                  legacy: step.title,
                },
                locale,
                { crossFallback: false },
              ) ||
              fallbackStep?.title ||
              '',
            description:
              cmsLocaleText(
                {
                  en: step.descriptionEn,
                  ar: step.descriptionAr,
                  legacy: step.description,
                },
                locale,
                { crossFallback: false },
              ) ||
              fallbackStep?.description ||
              '',
          }
        })
      : fallback.steps

  return {
    title:
      cmsLocaleText(
        { en: data.titleEn, ar: data.titleAr, legacy: data.title },
        locale,
        { crossFallback: false },
      ) || fallback.title,
    thumbnailImage: data.thumbnailImage?.trim() || fallback.thumbnailImage,
    videoUrl: data.videoUrl?.trim() || '',
    steps,
  }
}

export function useHowItWorksSettings() {
  const { t, i18n } = useTranslation()
  const [apiData, setApiData] = useState<ApiHowItWorksSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const response = await getHowItWorksSettings()
        if (cancelled) return
        setApiData(response.data ?? null)
      } catch {
        if (!cancelled) setApiData(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const data = useMemo(() => {
    const fallback = buildI18nFallback(t)
    if (!apiData) return fallback
    return mapApiToView(apiData, fallback, i18n.language)
  }, [apiData, i18n.language, t])

  return { data, loading }
}
