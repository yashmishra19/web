import api from './client'
import type { AnalyticsData } from '../../../shared/types'

export const analyticsApi = {
  get: async (
    range: '7d' | '14d' | '30d' = '14d'
  ): Promise<AnalyticsData> => {
    const res = await api.get(`/analytics?range=${range}`)
    return res.data.data
  },
}
