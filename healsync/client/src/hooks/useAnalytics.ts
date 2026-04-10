import { useState, useEffect } from 'react'
import { MOCK_ANALYTICS } from '../mock/data'
import type { AnalyticsData, TimeSeriesPoint } from '../../../shared/types'

type Range = '7d' | '14d' | '30d'

export function useAnalytics(range: Range = '14d') {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem('healsync_checkins')
        const stored = raw ? JSON.parse(raw) : []

        const days = range === '7d' ? 7 : range === '14d' ? 14 : 30

        const merged: AnalyticsData = {
          mood: buildSeries(MOCK_ANALYTICS.mood, stored, 'mood', days),
          sleep: buildSeries(MOCK_ANALYTICS.sleep, stored, 'sleepHours', days),
          stress: buildSeries(MOCK_ANALYTICS.stress, stored, 'stress', days),
          wellness: buildSeries(MOCK_ANALYTICS.wellness, stored, 'wellnessScore', days),
        }

        setData(merged)
        setIsLoading(false)
      } catch {
        setData(MOCK_ANALYTICS)
        setIsLoading(false)
      }
    }, 800)
    
    return () => clearTimeout(timer)
  }, [range])

  return { data, isLoading }
}

function buildSeries(
  mockPoints: TimeSeriesPoint[],
  stored: any[],
  field: string,
  days: number
): TimeSeriesPoint[] {
  const base = mockPoints.slice(-days)
  return base.map(point => {
    const match = stored.find(s =>
      new Date(s.date).toDateString() === new Date(point.date).toDateString()
    )
    if (match && match[field] !== undefined) {
      return { date: point.date, value: match[field] }
    }
    return point
  })
}
