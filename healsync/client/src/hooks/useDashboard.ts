import { useState, useEffect } from 'react'
import { dashboardApi } from '../api'
import { isNetworkError } from '../api/apiUtils'
import { useBackend } from '../context/BackendContext'
import { MOCK_DASHBOARD } from '../mock/data'
import type { DashboardSummary } from '../../../shared/types'

export function useDashboard() {
  const { isOnline } = useBackend()
  const [data, setData] =
    useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setIsLoading(true)
      if (isOnline) {
        const result = await dashboardApi.get()
        setData(result)
      } else {
        await new Promise(r => setTimeout(r, 800))
        setData(MOCK_DASHBOARD)
      }
    } catch (err: any) {
      if (isNetworkError(err)) {
        setData(MOCK_DASHBOARD)
      } else {
        setError('Failed to load dashboard')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [isOnline])

  return { data, isLoading, error, refetch: load }
}
