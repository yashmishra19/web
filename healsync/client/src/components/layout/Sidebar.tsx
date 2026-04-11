import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  BookOpen,
  Wind,
  BarChart2,
  Settings,
  LogOut,
  Calendar,
  Heart,
  MessageCircle,
} from 'lucide-react';
import StreakWidget from '../StreakWidget';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useBackend } from '../../context/BackendContext';
import { authApi } from '../../api';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Nav items
// ---------------------------------------------------------------------------

interface NavItem {
  label: string;
  icon:  LucideIcon;
  href:  string;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard',  icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Check-In',   icon: ClipboardCheck,  href: '/checkin'   },
  { label: 'Journal',    icon: BookOpen,        href: '/journal'   },
  { label: 'Breathing',  icon: Wind,            href: '/breathing' },
  { label: 'Analytics',  icon: BarChart2,       href: '/analytics' },
  { label: 'Mood History', icon: Calendar,  href: '/mood-history' },
  { label: 'Self-Care',    icon: Heart,     href: '/self-care' },
  { label: 'AI Assistant', icon: MessageCircle, href: '/chat', badge: 'Beta' },
  { label: 'Settings',   icon: Settings,        href: '/settings'  },
];

// ---------------------------------------------------------------------------
// Logo SVG (shared with LoadingScreen)
// ---------------------------------------------------------------------------

function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <div
      className="rounded-xl bg-mint-500 flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: size * 0.6, height: size * 0.6 }}
        aria-hidden="true"
      >
        <path d="M12 2a9 9 0 0 1 9 9c0 4.17-2.84 7.67-6.75 8.66A9 9 0 0 1 3 11a9 9 0 0 1 9-9z" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8"  y1="12" x2="16" y2="12" />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SidebarContent — shared between Sidebar (desktop) and MobileDrawer
// ---------------------------------------------------------------------------

interface SidebarContentProps {
  onLinkClick?: () => void;
}

export function SidebarContent({ onLinkClick }: SidebarContentProps) {
  const { user, logout }   = useAuth();
  const { isOnline }       = useBackend();
  const navigate           = useNavigate();

  async function handleLogout() {
    if (isOnline) {
      try {
        await authApi.logout();
      } catch {
        // silent — clear local state anyway
      }
    }
    logout();
    onLinkClick?.();
    navigate('/login');
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'U';

  return (
    <>
      {/* 1 — Logo area */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <LogoMark size={40} />
          <span className="text-lg font-medium text-gray-800 dark:text-gray-100">
            HealSync
          </span>
        </div>
      </div>

      {/* 2 — Navigation links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onLinkClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm',
                'transition-colors duration-150 cursor-pointer w-full',
                isActive
                  ? 'bg-mint-50 text-mint-700 font-medium dark:bg-mint-900/20 dark:text-mint-400'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
              )
            }
          >
            <item.icon size={18} className="shrink-0" aria-hidden="true" />
            {item.label}
            {item.badge && (
              <span className="ml-auto text-xs bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-md font-medium">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 3 — Streak badge */}
      <div className="pt-2">
        <StreakWidget compact />
      </div>

      {/* 4 — User area */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-mint-100 dark:bg-mint-900/30
                          flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-mint-700 dark:text-mint-400">
              {initial}
            </span>
          </div>

          {/* Name + email */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-400 truncate max-w-[120px]">
              {user?.email}
            </p>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1 shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sidebar — desktop only (hidden on mobile via hidden md:flex)
// ---------------------------------------------------------------------------

export default function Sidebar() {
  return (
    <aside
      className="hidden md:flex md:flex-col w-64 shrink-0
                 bg-white dark:bg-gray-900
                 border-r border-gray-100 dark:border-gray-800
                 z-30"
    >
      <SidebarContent />
    </aside>
  );
}
