import { IDailyCheckIn } from '../models/DailyCheckIn'

export function computeWellnessScore(
  data: Partial<IDailyCheckIn>
): number {
  const mood     = ((data.mood     || 3) / 5) * 25
  const sleep    = Math.min(
    (data.sleepHours || 0) / 8, 1) * 25
  const water    = Math.min(
    (data.waterIntakeLiters || 0) / 2.5, 1) * 20
  const activity = Math.min(
    (data.stepsOrMinutes || 0) / 30, 1) * 15
  const stress   = ((6 - (data.stress || 3)) / 5) * 15
  return Math.round(
    mood + sleep + water + activity + stress
  )
}

export function computeStreakUpdate(
  lastCheckInDate: Date | null,
  currentStreak: number
): number {
  if (!lastCheckInDate) return 1

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const last = new Date(lastCheckInDate)
  last.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (last.toDateString() === today.toDateString())
    return currentStreak
  if (last.toDateString() === yesterday.toDateString())
    return currentStreak + 1
  return 1
}

export function computeWellnessStatus(
  scores: number[]
): 'improving' | 'stable' | 'needs_attention' {
  if (scores.length < 3) return 'stable'
  const recent = scores.slice(-3)
  const older  = scores.slice(-6, -3)
  if (older.length === 0) return 'stable'
  const recentAvg =
    recent.reduce((a, b) => a + b, 0) / recent.length
  const olderAvg =
    older.reduce((a, b) => a + b, 0) / older.length
  if (recentAvg > olderAvg + 3)  return 'improving'
  if (recentAvg < olderAvg - 3)  return 'needs_attention'
  return 'stable'
}
