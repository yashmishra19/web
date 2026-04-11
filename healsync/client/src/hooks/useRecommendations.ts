import { useState, useEffect } from 'react'
import { recommendationApi } from '../api'
import { isNetworkError } from '../api/apiUtils'
import { useBackend } from '../context/BackendContext'
import { MOCK_RECOMMENDATIONS } from '../mock/data'
import type { Recommendation }
  from '../../../shared/types'

export function useRecommendations() {
  const { isOnline } = useBackend()
  const [data, setData] =
    useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] =
    useState<string | null>(null)

  const load = async () => {
    let mounted = true
    try {
      setIsLoading(true)
      setError(null)

      if (isOnline) {
        const result = await recommendationApi.get()
        if (mounted) setData(result)
      } else {
        await new Promise(r => setTimeout(r, 500))
        if (mounted) setData(MOCK_RECOMMENDATIONS)
      }
    } catch (err: any) {
      if (!mounted) return
      if (isNetworkError(err)) {
        setData(MOCK_RECOMMENDATIONS)
      } else {
        setError('Failed to load recommendations')
      }
    } finally {
      if (mounted) setIsLoading(false)
    }
    return () => { mounted = false }
  }

  useEffect(() => {
    load()
  }, [isOnline])

  const markRead = async (id: string) => {
    try {
      if (isOnline) {
        await recommendationApi.markRead(id)
      }
      setData(prev =>
        prev.map(r =>
          r.id === id ? { ...r, isRead: true } : r
        )
      )
    } catch {
      // silent fail
    }
  }

  return { data, isLoading, error, markRead, refetch: load }
}
