import api from './client'
import type {
  CheckInPayload,
  CheckIn,
} from '../../../shared/types'

export const checkInApi = {

  create: async (
    payload: CheckInPayload
  ): Promise<CheckIn> => {
    const res = await api.post('/checkins', payload)
    return res.data.data
  },

  getAll: async (days = 14): Promise<CheckIn[]> => {
    const res = await api.get(`/checkins?days=${days}`)
    return res.data.data
  },

  getToday: async (): Promise<CheckIn | null> => {
    const res = await api.get('/checkins/today')
    return res.data.data
  },
}
