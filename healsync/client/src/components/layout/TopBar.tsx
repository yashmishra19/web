import { useState } from 'react';
import { Menu, Sun, Moon, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useBackend } from '../../context/BackendContext';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationDropdown from '../NotificationDropdown';

interface TopBarProps {
  onMenuClick: () => void;
  title?:      string;
}

export default function TopBar({ onMenuClick, title }: TopBarProps) {
  const { user }                    = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const { isOnline, isChecking }    = useBackend();
  const {
    activeReminderCount,
    unseenCount,
    markAllSeen,
  } = useNotifications();

  const [showNotifs, setShowNotifs] = useState(false);

  const isDark   = resolvedTheme === 'dark';
  const initial  = user?.name?.charAt(0)?.toUpperCase() ?? 'U';

  // Badge = unseen count first, then fall back to total active count
  const badgeCount = unseenCount > 0 ? unseenCount : activeReminderCount;

  const handleBellClick = () => {
    const opening = !showNotifs;
    setShowNotifs(opening);
    if (opening) markAllSeen();
  };

  return (
    <header
      className="h-16 bg-white dark:bg-gray-900
                 border-b border-gray-100 dark:border-gray-800
                 flex items-center justify-between px-4 gap-4
                 sticky top-0 z-20 shrink-0"
    >
      {/* Left section */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="btn-ghost p-2 md:hidden"
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        {/* Page title */}
        {title && (
          <span className="text-base font-medium text-gray-800 dark:text-white truncate">
            {title}
          </span>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Dark mode toggle */}
        <button
          type="button"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="btn-ghost p-2 rounded-xl"
        >
          {isDark
            ? <Sun  size={18} aria-hidden="true" />
            : <Moon size={18} aria-hidden="true" />
          }
        </button>

        {!isChecking && (
          <div className={`
            hidden sm:flex items-center gap-1.5
            px-2.5 py-1 rounded-lg text-xs font-medium
            border transition-colors
            ${isOnline
              ? 'bg-mint-50 border-mint-200 text-mint-600 dark:bg-mint-900/20 dark:border-mint-700 dark:text-mint-400'
              : 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-400'
            }
          `}>
            <div className={`
              w-1.5 h-1.5 rounded-full
              ${isOnline ? 'bg-mint-400' : 'bg-amber-400 animate-pulse'}
            `} />
            {isOnline ? 'Connected' : 'Offline mode'}
          </div>
        )}

        {/* Notification bell with dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={handleBellClick}
            aria-label={badgeCount > 0 ? `Notifications (${badgeCount})` : 'Notifications'}
            className="btn-ghost p-2 rounded-xl relative"
          >
            <Bell size={18} className="text-gray-600 dark:text-gray-300" aria-hidden="true" />

            {/* Badge */}
            {badgeCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center px-1 leading-none">
                {badgeCount > 9 ? '9+' : badgeCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={showNotifs}
            onClose={() => setShowNotifs(false)}
          />
        </div>

        {/* User avatar — mobile only */}
        <div
          className="md:hidden w-8 h-8 rounded-full bg-mint-100 dark:bg-mint-900/30
                     flex items-center justify-center ml-1"
          aria-hidden="true"
        >
          <span className="text-xs font-medium text-mint-700 dark:text-mint-400">
            {initial}
          </span>
        </div>
      </div>
    </header>
  );
}
