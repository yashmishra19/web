import api from './client'
import type {
  VitalsPayload,
  VitalsReading,
  VitalsSuggestion,
} from '../../../shared/types'

export const vitalsApi = {

  save: async (payload: VitalsPayload): Promise<{
    reading: VitalsReading
    suggestions: VitalsSuggestion[]
  }> => {
    const res = await api.post('/vitals', payload)
    return res.data.data
  },

  getAll: async (days = 7): Promise<VitalsReading[]> => {
    const res = await api.get(`/vitals?days=${days}`)
    return res.data.data
  },

  getLatest: async ():
    Promise<VitalsReading | null> => {
    const res = await api.get('/vitals/latest')
    return res.data.data
  },

  getSuggestions: async (
    payload: Partial<VitalsPayload>
  ): Promise<VitalsSuggestion[]> => {
    const res = await api.post(
      '/vitals/suggestions', payload
    )
    return res.data.data
  },
}
