import { useState, useEffect } from 'react'
import { analyticsApi } from '../api'
import { useBackend } from '../context/BackendContext'
import { MOCK_ANALYTICS } from '../mock/data'
import type { AnalyticsData } from '../../../shared/types'

type Range = '7d' | '14d' | '30d'

export function useAnalytics(range: Range = '14d') {
  const { isOnline } = useBackend()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        if (isOnline) {
          const result = await analyticsApi.get(range)
          setData(result)
        } else {
          await new Promise(r => setTimeout(r, 800))
          setData(MOCK_ANALYTICS)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
        setData(MOCK_ANALYTICS)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [range, isOnline])

  return { data, isLoading, error }
}
