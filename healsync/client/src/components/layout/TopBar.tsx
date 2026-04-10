import { Menu, Sun, Moon, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

interface TopBarProps {
  onMenuClick: () => void;
  title?:      string;
}

export default function TopBar({ onMenuClick, title }: TopBarProps) {
  const { user }                       = useAuth();
  const { resolvedTheme, setTheme }    = useTheme();

  const isDark    = resolvedTheme === 'dark';
  const initial   = user?.name?.charAt(0)?.toUpperCase() ?? 'U';
  const hasUnread = true; // hardcoded until notifications are implemented

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
          <span className="text-base font-medium text-gray-800 dark:text-gray-100 truncate">
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

        {/* Notification bell */}
        <button
          type="button"
          aria-label={hasUnread ? 'Notifications (unread)' : 'Notifications'}
          className="btn-ghost p-2 rounded-xl relative"
        >
          <Bell size={18} aria-hidden="true" />
          {hasUnread && (
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"
              aria-hidden="true"
            />
          )}
        </button>

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
