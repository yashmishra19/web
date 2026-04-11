import { useEffect, useCallback } from 'react'
import { useSettings } from './useSettings'

export function useNotifications() {
  const { settings } = useSettings()

  const requestPermission =
    useCallback(async (): Promise<boolean> => {
      if (!('Notification' in window)) return false
      if (Notification.permission === 'granted')
        return true
      if (Notification.permission === 'denied')
        return false
      const result = await Notification.requestPermission()
      return result === 'granted'
    }, [])

  const sendNotification = useCallback((
    title: string,
    body: string,
    icon = '/favicon.svg'
  ) => {
    if (Notification.permission !== 'granted') return
    new Notification(title, {
      body,
      icon,
      badge: '/favicon.svg',
    })
  }, [])

  const checkAndSendReminders =
    useCallback(() => {
      const now = new Date()
      const currentTime =
        `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

      // Check-in reminder
      if (
        settings.checkInEnabled &&
        currentTime === settings.checkInTime
      ) {
        const hasCheckedIn = localStorage.getItem(
          'healsync_last_checkin_date'
        ) === now.toDateString()

        if (!hasCheckedIn) {
          sendNotification(
            'Time for your daily check-in 🌿',
            'Take 2 minutes to log how you are feeling today.',
          )
        }
      }

      // Sleep reminder
      if (
        settings.sleepEnabled &&
        currentTime === settings.sleepTime
      ) {
        sendNotification(
          'Bedtime reminder 🌙',
          'Time to wind down. Good sleep is essential for your wellbeing.',
        )
      }

      // Stretch reminder
      if (
        settings.stretchEnabled &&
        currentTime === settings.stretchTime
      ) {
        sendNotification(
          'Movement break 🧘',
          'Stand up and stretch for 5 minutes. Your body will thank you.',
        )
      }

      // Water reminders (interval-based)
      if (settings.waterEnabled) {
        const intervalKey = 'healsync_last_water_notif'
        const lastNotif = localStorage.getItem(intervalKey)
        const intervalMs =
          settings.waterIntervalHours * 60 * 60 * 1000
        const shouldNotify = !lastNotif ||
          now.getTime() - parseInt(lastNotif || '0') > intervalMs

        if (shouldNotify) {
          sendNotification(
            'Stay hydrated 💧',
            `Drink a glass of water. Target: 2.5L daily.`,
          )
          localStorage.setItem(
            intervalKey,
            now.getTime().toString()
          )
        }
      }
    }, [settings, sendNotification])

  // Check every minute
  useEffect(() => {
    const interval = setInterval(
      checkAndSendReminders, 60000
    )
    return () => clearInterval(interval)
  }, [checkAndSendReminders])

  return {
    requestPermission,
    sendNotification,
    isSupported: 'Notification' in window,
    permission: typeof window !== 'undefined'
      ? Notification.permission
      : 'default',
  }
}
