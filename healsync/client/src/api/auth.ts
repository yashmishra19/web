import api from './client'
import type {
  SignupPayload,
  LoginPayload,
  AuthResponse,
} from '../../../shared/types'

export const authApi = {

  signup: async (
    payload: SignupPayload
  ): Promise<AuthResponse> => {
    const res = await api.post('/auth/signup', payload)
    return res.data.data
  },

  login: async (
    payload: LoginPayload
  ): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', payload)
    return res.data.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  getMe: async () => {
    const res = await api.get('/auth/me')
    return res.data.data
  },
}
