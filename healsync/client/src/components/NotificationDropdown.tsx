import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../hooks/useNotifications'
import { Bell, Settings, ChevronRight, Clock, X } from 'lucide-react'

interface Props {
  isOpen:  boolean
  onClose: () => void
}

export default function NotificationDropdown({ isOpen, onClose }: Props) {
  const navigate = useNavigate()
  const {
    getUpcomingReminders,
    activeReminderCount,
    permission,
    requestPermission,
  } = useNotifications()

  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const reminders = getUpcomingReminders()

  function formatTime(minutesUntil: number, isOverdue: boolean, timeStr: string): string {
    if (timeStr.startsWith('Every')) return timeStr
    if (isOverdue) return `${timeStr} (past)`
    if (minutesUntil < 60) return `in ${minutesUntil}m`
    const hrs = Math.floor(minutesUntil / 60)
    const min = minutesUntil % 60
    return min > 0 ? `in ${hrs}h ${min}m` : `in ${hrs}h`
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">Reminders</span>
          {activeReminderCount > 0 && (
            <span className="text-xs bg-mint-100 dark:bg-mint-900/30 text-mint-700 dark:text-mint-400 px-1.5 py-0.5 rounded-full font-medium">
              {activeReminderCount} active
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-0.5 rounded-lg"
        >
          <X size={14} />
        </button>
      </div>

      {/* Permission banner */}
      {permission !== 'granted' && (
        <div className="mx-3 mt-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-800 dark:text-amber-300 font-medium mb-1">
            Enable browser notifications
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">
            Get notified even when the app is in the background
          </p>
          {permission === 'denied' ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              Notifications blocked. Enable in browser settings.
            </p>
          ) : (
            <button
              onClick={requestPermission}
              className="text-xs font-medium bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors"
            >
              Enable notifications
            </button>
          )}
        </div>
      )}

      {/* Reminders list */}
      <div className="p-3 space-y-1">
        {reminders.length === 0 ? (
          <div className="text-center py-6">
            <Bell size={28} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400 dark:text-gray-500">No reminders enabled</p>
            <button
              onClick={() => { navigate('/settings'); onClose() }}
              className="text-xs text-mint-600 dark:text-mint-400 mt-1 hover:underline"
            >
              Go to settings →
            </button>
          </div>
        ) : (
          reminders.map(reminder => (
            <button
              key={reminder.id}
              onClick={() => { navigate(reminder.route); onClose() }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group"
            >
              {/* Emoji icon */}
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 flex items-center justify-center text-lg shrink-0 transition-colors">
                {reminder.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug">
                  {reminder.label}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock size={10} className={reminder.isOverdue ? 'text-red-400' : 'text-gray-400 dark:text-gray-500'} />
                  <span className={`text-xs ${reminder.isOverdue ? 'text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {formatTime(reminder.minutesUntil, reminder.isOverdue, reminder.time)}
                  </span>
                </div>
              </div>

              {/* Status dot */}
              <div className={`w-2 h-2 rounded-full shrink-0 ${reminder.isOverdue ? 'bg-red-400' : 'bg-mint-400'}`} />
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
        <button
          onClick={() => { navigate('/settings'); onClose() }}
          className="flex items-center justify-between w-full text-xs text-gray-500 dark:text-gray-400 hover:text-mint-600 dark:hover:text-mint-400 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Settings size={12} />
            Manage reminders
          </span>
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  )
}
