import type { CheckInPayload, CheckIn } from '../../../shared/types'

const CHECKINS_KEY = 'healsync_checkins'

export function useCheckIn() {
  const getStoredCheckIns = (): CheckIn[] => {
    try {
      const raw = localStorage.getItem(CHECKINS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  }

  const hasCheckedInToday = (): boolean => {
    const checkins = getStoredCheckIns()
    const today = new Date().toDateString()
    return checkins.some(c => new Date(c.date).toDateString() === today)
  }

  const computeWellnessScore = (data: CheckInPayload): number => {
    const mood     = (data.mood / 5) * 25
    const sleep    = Math.min(data.sleepHours / 8, 1) * 25
    const water    = Math.min(data.waterIntakeLiters / 2.5, 1) * 20
    const activity = Math.min(data.stepsOrMinutes / 30, 1) * 15
    const stress   = ((6 - data.stress) / 5) * 15
    return Math.round(mood + sleep + water + activity + stress)
  }

  const saveCheckIn = (payload: CheckInPayload): CheckIn => {
    const checkins = getStoredCheckIns()
    const newCheckIn: CheckIn = {
      id: Date.now().toString(),
      userId: 'mock-user-1',
      ...payload,
      wellnessScore: computeWellnessScore(payload),
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    const updated = [newCheckIn, ...checkins]
    localStorage.setItem(CHECKINS_KEY, JSON.stringify(updated))
    return newCheckIn
  }

  return { saveCheckIn, hasCheckedInToday, getStoredCheckIns, computeWellnessScore }
}
