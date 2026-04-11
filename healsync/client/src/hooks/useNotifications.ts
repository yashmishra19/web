import { useEffect, useCallback, useState } from 'react'
import { useSettings } from './useSettings'

export function useNotifications() {
  const { settings } = useSettings()

  // Tick every minute so getUpcomingReminders recalculates overdue status
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  // ── Permission / send ──────────────────────────────────

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false
    const result = await Notification.requestPermission()
    return result === 'granted'
  }, [])

  const sendNotification = useCallback((
    title: string,
    body: string,
    icon = '/favicon.svg'
  ) => {
    if (Notification.permission !== 'granted') return
    new Notification(title, { body, icon, badge: '/favicon.svg' })
  }, [])

  // ── Interval reminder checker ──────────────────────────

  const checkAndSendReminders = useCallback(() => {
    const now = new Date()
    const currentTime =
      `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

    if (settings.checkInEnabled && currentTime === settings.checkInTime) {
      const hasCheckedIn =
        localStorage.getItem('healsync_last_checkin_date') === now.toDateString()
      if (!hasCheckedIn) {
        sendNotification(
          'Time for your daily check-in 🌿',
          'Take 2 minutes to log how you are feeling today.',
        )
      }
    }

    if (settings.sleepEnabled && currentTime === settings.sleepTime) {
      sendNotification(
        'Bedtime reminder 🌙',
        'Time to wind down. Good sleep is essential for your wellbeing.',
      )
    }

    if (settings.stretchEnabled && currentTime === settings.stretchTime) {
      sendNotification(
        'Movement break 🧘',
        'Stand up and stretch for 5 minutes. Your body will thank you.',
      )
    }

    if (settings.waterEnabled) {
      const intervalKey = 'healsync_last_water_notif'
      const lastNotif   = localStorage.getItem(intervalKey)
      const intervalMs  = settings.waterIntervalHours * 60 * 60 * 1000
      const shouldNotify =
        !lastNotif || now.getTime() - parseInt(lastNotif || '0') > intervalMs

      if (shouldNotify) {
        sendNotification(
          'Stay hydrated 💧',
          `Drink a glass of water. Target: 2.5L daily.`,
        )
        localStorage.setItem(intervalKey, now.getTime().toString())
      }
    }
  }, [settings, sendNotification])

  useEffect(() => {
    const interval = setInterval(checkAndSendReminders, 60000)
    return () => clearInterval(interval)
  }, [checkAndSendReminders])

  // ── Upcoming reminders list (recalculates every minute) ─

  const getUpcomingReminders = useCallback(() => {
    void tick // dependency — triggers recalc every minute

    const now     = new Date()
    const current = now.getHours() * 60 + now.getMinutes()

    const reminders: {
      id:           string
      label:        string
      time:         string
      minutesUntil: number
      isOverdue:    boolean
      icon:         string
      route:        string
    }[] = []

    if (settings.checkInEnabled) {
      const [h, m] = settings.checkInTime.split(':').map(Number)
      const reminderMin = h * 60 + m
      const diff        = reminderMin - current
      reminders.push({
        id:           'checkin',
        label:        'Daily check-in',
        time:         settings.checkInTime,
        minutesUntil: diff,
        isOverdue:    diff < 0,
        icon:         '📋',
        route:        '/checkin',
      })
    }

    if (settings.sleepEnabled) {
      const [h, m] = settings.sleepTime.split(':').map(Number)
      const reminderMin = h * 60 + m
      const diff        = reminderMin - current
      reminders.push({
        id:           'sleep',
        label:        'Bedtime reminder',
        time:         settings.sleepTime,
        minutesUntil: diff,
        isOverdue:    diff < 0,
        icon:         '🌙',
        route:        '/breathing',
      })
    }

    if (settings.stretchEnabled) {
      const [h, m] = settings.stretchTime.split(':').map(Number)
      const reminderMin = h * 60 + m
      const diff        = reminderMin - current
      reminders.push({
        id:           'stretch',
        label:        'Movement break',
        time:         settings.stretchTime,
        minutesUntil: diff,
        isOverdue:    diff < 0,
        icon:         '🧘',
        route:        '/breathing',
      })
    }

    if (settings.waterEnabled) {
      reminders.push({
        id:           'water',
        label:        'Water reminder',
        time:         `Every ${settings.waterIntervalHours}h`,
        minutesUntil: 0,
        isOverdue:    false,
        icon:         '💧',
        route:        '/checkin',
      })
    }

    return reminders.sort((a, b) => {
      // Upcoming first, then overdue
      if (!a.isOverdue && b.isOverdue) return -1
      if (a.isOverdue && !b.isOverdue) return 1
      return a.minutesUntil - b.minutesUntil
    })
  }, [settings, tick])

  // ── Active count + unseen badge ────────────────────────

  const activeReminderCount = [
    settings.checkInEnabled,
    settings.sleepEnabled,
    settings.stretchEnabled,
    settings.waterEnabled,
  ].filter(Boolean).length

  const SEEN_KEY = 'healsync_notifs_seen_at'
  const [unseenCount, setUnseenCount] = useState<number>(0)

  useEffect(() => {
    const lastSeen = localStorage.getItem(SEEN_KEY)
    if (!lastSeen) {
      setUnseenCount(activeReminderCount)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const markAllSeen = useCallback(() => {
    setUnseenCount(0)
    localStorage.setItem(SEEN_KEY, Date.now().toString())
  }, [])

  // ── Return ─────────────────────────────────────────────

  return {
    requestPermission,
    sendNotification,
    isSupported:          'Notification' in window,
    permission:           typeof window !== 'undefined'
                            ? Notification.permission
                            : ('default' as NotificationPermission),
    getUpcomingReminders,
    activeReminderCount,
    unseenCount,
    markAllSeen,
  }
}
