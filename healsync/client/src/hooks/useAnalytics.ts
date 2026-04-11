import { useState, useEffect } from 'react'
import { analyticsApi } from '../api'
import { isNetworkError } from '../api/apiUtils'
import { useBackend } from '../context/BackendContext'
import { MOCK_ANALYTICS } from '../mock/data'
import type { AnalyticsData }
  from '../../../shared/types'

type Range = '7d' | '14d' | '30d'

export function useAnalytics(range: Range = '14d') {
  const { isOnline } = useBackend()
  const [data, setData] =
    useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (isOnline) {
          const result = await analyticsApi.get(range)
          if (mounted) setData(result)
        } else {
          await new Promise(r => setTimeout(r, 800))
          if (mounted) setData(MOCK_ANALYTICS)
        }
      } catch (err: any) {
        if (!mounted) return
        if (isNetworkError(err)) {
          setData(MOCK_ANALYTICS)
        } else {
          setError('Failed to load analytics')
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [range, isOnline])

  return { data, isLoading, error }
}
