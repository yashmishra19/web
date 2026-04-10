import api from './client'
import type { Recommendation } from '../../../shared/types'

export const recommendationApi = {

  get: async (): Promise<Recommendation[]> => {
    const res = await api.get('/recommendations')
    return res.data.data
  },

  getHistory: async (): Promise<Recommendation[]> => {
    const res = await api.get('/recommendations/history')
    return res.data.data
  },

  markRead: async (id: string): Promise<Recommendation> => {
    const res = await api.patch(
      `/recommendations/${id}/read`
    )
    return res.data.data
  },
}
