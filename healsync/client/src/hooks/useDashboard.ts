import { useState, useEffect } from 'react'
import { MOCK_DASHBOARD } from '../mock/data'
import type { DashboardSummary } from '@shared/types'

export function useDashboard() {
  const [data, setData]       = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setData(MOCK_DASHBOARD)
        setIsLoading(false)
      } catch {
        setError('Failed to load dashboard')
        setIsLoading(false)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return { data, isLoading, error }
}
