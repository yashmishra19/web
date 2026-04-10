import api from './client'
import type { DashboardSummary } from '../../../shared/types'

export const dashboardApi = {
  get: async (): Promise<DashboardSummary> => {
    const res = await api.get('/dashboard')
    return res.data.data
  },
}
