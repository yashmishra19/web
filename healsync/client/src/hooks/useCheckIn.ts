import { useCallback } from 'react'
import { checkInApi } from '../api'
import { isNetworkError } from '../api/apiUtils'
import { useBackend } from '../context/BackendContext'
import type {
  CheckInPayload,
  CheckIn,
} from '../../../shared/types'

const CHECKINS_KEY = 'healsync_checkins'

export function useCheckIn() {
  const { isOnline } = useBackend()

  const getStoredCheckIns = (): CheckIn[] => {
    try {
      const raw = localStorage.getItem(CHECKINS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  const computeWellnessScore = (
    data: CheckInPayload
  ): number => {
    const mood     = (data.mood / 5) * 25
    const sleep    = Math.min(
      data.sleepHours / 8, 1) * 25
    const water    = Math.min(
      data.waterIntakeLiters / 2.5, 1) * 20
    const activity = Math.min(
      data.stepsOrMinutes / 30, 1) * 15
    const stress   = ((6 - data.stress) / 5) * 15
    return Math.round(
      mood + sleep + water + activity + stress
    )
  }

  const saveLocalCheckIn = useCallback((
    payload: CheckInPayload
  ): CheckIn => {
    const newCheckIn: CheckIn = {
      id:           Date.now().toString(),
      userId:       'mock-user-1',
      ...payload,
      wellnessScore: computeWellnessScore(payload),
      date:         new Date().toISOString(),
      createdAt:    new Date().toISOString(),
    }
    const stored  = getStoredCheckIns()
    const updated = [newCheckIn, ...stored]
    localStorage.setItem(
      CHECKINS_KEY, JSON.stringify(updated)
    )
    return newCheckIn
  }, [])

  const saveCheckIn = useCallback(async (
    payload: CheckInPayload
  ): Promise<CheckIn> => {
    if (isOnline) {
      try {
        const checkIn = await checkInApi.create(payload)
        // Cache locally too
        const stored = getStoredCheckIns()
        localStorage.setItem(
          CHECKINS_KEY,
          JSON.stringify([checkIn, ...stored])
        )
        return checkIn
      } catch (err: any) {
        if (isNetworkError(err)) {
          // Network dropped — save locally
          return saveLocalCheckIn(payload)
        }
        throw err
      }
    } else {
      return saveLocalCheckIn(payload)
    }
  }, [isOnline, saveLocalCheckIn])

  const hasCheckedInToday = useCallback(async ():
    Promise<boolean> => {
    if (isOnline) {
      try {
        const today = await checkInApi.getToday()
        return today !== null
      } catch {
        // Fall through to localStorage check
      }
    }
    const checkins = getStoredCheckIns()
    const todayStr = new Date().toDateString()
    return checkins.some(
      c => new Date(c.date).toDateString() === todayStr
    )
  }, [isOnline])

  const getRecentCheckIns = useCallback(async (
    days = 14
  ): Promise<CheckIn[]> => {
    if (isOnline) {
      try {
        return await checkInApi.getAll(days)
      } catch {
        // Fall through to localStorage
      }
    }
    return getStoredCheckIns().slice(0, days)
  }, [isOnline])

  return {
    saveCheckIn,
    hasCheckedInToday,
    getStoredCheckIns,
    getRecentCheckIns,
    computeWellnessScore,
  }
}
