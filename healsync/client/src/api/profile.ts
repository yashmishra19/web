import api from './client'
import type {
  OnboardingPayload,
  UserProfile,
  ReminderSettings,
} from '../../../shared/types'

export const profileApi = {

  saveOnboarding: async (
    payload: OnboardingPayload
  ): Promise<UserProfile> => {
    const res = await api.post('/profile/onboarding', payload)
    return res.data.data
  },

  getProfile: async (): Promise<UserProfile | null> => {
    const res = await api.get('/profile/me')
    return res.data.data
  },

  updateReminders: async (
    settings: ReminderSettings
  ) => {
    const res = await api.put('/profile/reminders', settings)
    return res.data.data
  },
}
