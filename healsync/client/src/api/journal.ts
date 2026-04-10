import api from './client'
import type {
  JournalEntry,
  JournalEntryPayload,
} from '../../../shared/types'

export const journalApi = {

  create: async (
    payload: JournalEntryPayload
  ): Promise<JournalEntry> => {
    const res = await api.post('/journal', payload)
    return res.data.data
  },

  getAll: async (page = 1, limit = 10) => {
    const res = await api.get(
      `/journal?page=${page}&limit=${limit}`
    )
    return res.data
  },

  update: async (
    id: string,
    payload: Partial<JournalEntryPayload>
  ): Promise<JournalEntry> => {
    const res = await api.put(`/journal/${id}`, payload)
    return res.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/journal/${id}`)
  },
}
