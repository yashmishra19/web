import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const STREAK_KEY = 'healsync_streak'

interface StreakData {
  currentStreak: number
  longestStreak: number
  lastCheckInDate: string | null
  totalCheckIns: number
  weeklyCheckIns: boolean[]   // last 7 days, true = checked in
}

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastCheckInDate: null,
  totalCheckIns: 0,
  weeklyCheckIns: [false, false, false, false, false, false, false],
}

export function useStreak() {
  const { user } = useAuth()
  const [streakData, setStreakData] = useState<StreakData>(DEFAULT_STREAK)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STREAK_KEY)
      if (raw) {
        setStreakData(JSON.parse(raw))
      } else {
        // Seed with mock streak for demo user
        const mockStreak: StreakData = {
          currentStreak: user?.streakCount || 7,
          longestStreak: 12,
          lastCheckInDate: new Date().toISOString(),
          totalCheckIns: 23,
          weeklyCheckIns: [true, true, false, true, true, true, true],
        }
        localStorage.setItem(STREAK_KEY, JSON.stringify(mockStreak))
        setStreakData(mockStreak)
      }
    } catch {}
  }, [user])

  const recordCheckIn = () => {
    const today = new Date().toDateString()
    const lastDate = streakData.lastCheckInDate
      ? new Date(streakData.lastCheckInDate).toDateString()
      : null

    if (lastDate === today) return  // already checked in today

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const isConsecutive = lastDate === yesterday.toDateString()

    const newStreak = isConsecutive ? streakData.currentStreak + 1 : 1
    const newLongest = Math.max(newStreak, streakData.longestStreak)

    // Update weekly array (shift left, add true for today)
    const newWeekly = [...streakData.weeklyCheckIns.slice(1), true]

    const updated: StreakData = {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastCheckInDate: new Date().toISOString(),
      totalCheckIns: streakData.totalCheckIns + 1,
      weeklyCheckIns: newWeekly,
    }

    setStreakData(updated)
    localStorage.setItem(STREAK_KEY, JSON.stringify(updated))
    return updated
  }

  const getStreakMessage = (streak: number): string => {
    if (streak === 0)  return 'Start your streak today!'
    if (streak === 1)  return 'Great start! Come back tomorrow.'
    if (streak < 5)    return `${streak} days strong. Keep going!`
    if (streak < 10)   return `${streak} day streak! You are on a roll.`
    if (streak < 30)   return `Amazing! ${streak} days in a row.`
    return `Incredible! ${streak} day streak. You are unstoppable!`
  }

  return { streakData, recordCheckIn, getStreakMessage }
}
