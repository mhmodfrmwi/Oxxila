// src/hooks/useReturnsHistoryPage.ts
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { getMyOrder } from '../api/orders'
import { getMyReturns, type ReturnRequest } from '../api/returns'
import { LOGIN_PATH } from '../config/routes'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'
import {
  isReturnsPreviewEnabled,
  resolveReturnHistoryOrPreview,
} from '../mocks/returns'
import { getReturnOrderId } from '../utils/returnTracking'

function enrichReturnItems(
  returns: ReturnRequest[],
  orderImages: Map<string, Map<string, string | null>>,
): ReturnRequest[] {
  return returns.map((entry) => {
    const orderId = getReturnOrderId(entry)
    const imageMap = orderImages.get(orderId)
    if (!imageMap) return entry

    return {
      ...entry,
      items: entry.items.map((item) => {
        const byProduct = imageMap.get(`p:${item.product}`)
        const byName = imageMap.get(`n:${item.name.toLowerCase()}`)
        return {
          ...item,
          image: byProduct ?? byName ?? item.image ?? null,
        }
      }),
    }
  })
}

export function useReturnsHistoryPage() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const [searchParams] = useSearchParams()
  const previewEnabled = isReturnsPreviewEnabled(searchParams)
  const [returns, setReturns] = useState<ReturnRequest[]>([])
  const [usingPreviewData, setUsingPreviewData] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false

    async function load() {
      await Promise.resolve()
      if (cancelled) return

      setLoading(true)
      setError('')

      try {
        const response = await getMyReturns({ limit: 50 })
        if (cancelled) return

        const resolved = resolveReturnHistoryOrPreview(response.data, previewEnabled)
        let list = resolved.returns

        if (!resolved.usingPreview && list.length > 0) {
          const orderIds = [
            ...new Set(list.map((entry) => getReturnOrderId(entry)).filter(Boolean)),
          ]

          const orderImages = new Map<string, Map<string, string | null>>()
          await Promise.all(
            orderIds.map(async (orderId) => {
              try {
                const orderResponse = await getMyOrder(orderId)
                const map = new Map<string, string | null>()
                for (const item of orderResponse.data?.items ?? []) {
                  map.set(`p:${item.product}`, item.image)
                  map.set(`n:${item.name.toLowerCase()}`, item.image)
                }
                orderImages.set(orderId, map)
              } catch {
                /* mosaics keep existing images when enrichment fails */
              }
            }),
          )

          if (cancelled) return
          list = enrichReturnItems(list, orderImages)
        }

        if (cancelled) return
        setReturns(list)
        setUsingPreviewData(resolved.usingPreview)
      } catch (err) {
        if (cancelled) return

        if (previewEnabled) {
          const resolved = resolveReturnHistoryOrPreview(null, true)
          setReturns(resolved.returns)
          setUsingPreviewData(resolved.usingPreview)
          setError('')
        } else {
          setReturns([])
          setUsingPreviewData(false)
          setError(
            err instanceof ApiError ? err.message : t('returnsHistory.loadFailed'),
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, previewEnabled, t])

  return {
    isAuthenticated,
    loginPath: LOGIN_PATH,
    returns,
    usingPreviewData,
    loading,
    error,
  }
}
