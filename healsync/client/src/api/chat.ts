import api from './client'

export const chatApi = {
  getHistory: async () => {
    const res = await api.get('/chat/history')
    return res.data.data
  },

  sendMessage: async (
    message: string,
    location?: { latitude: number; longitude: number }
  ) => {
    const res = await api.post('/chat', { message, location })
    // Returns { data: ChatMessage, emergencyDispatched: boolean }
    return res.data
  },
}
