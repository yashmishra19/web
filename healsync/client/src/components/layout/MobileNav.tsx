import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  BookOpen,
  BarChart2,
  Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavItem {
  label: string;
  icon:  LucideIcon;
  href:  string;
}

const navItems: MobileNavItem[] = [
  { label: 'Home',      icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Check-In',  icon: ClipboardCheck,  href: '/checkin'   },
  { label: 'Journal',   icon: BookOpen,        href: '/journal'   },
  { label: 'Analytics', icon: BarChart2,       href: '/analytics' },
  { label: 'Settings',  icon: Settings,        href: '/settings'  },
];

export default function MobileNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30
                 bg-white dark:bg-gray-900
                 border-t border-gray-100 dark:border-gray-800
                 h-16 flex items-center justify-around px-2"
      aria-label="Mobile navigation"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 px-3 py-2',
              'text-xs transition-colors duration-150',
              isActive
                ? 'text-mint-600 dark:text-mint-400'
                : 'text-gray-400 dark:text-gray-500'
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon size={20} aria-hidden="true" />
              <span>{item.label}</span>
              {isActive && (
                <span
                  className="w-1 h-1 rounded-full bg-mint-500 mx-auto mt-0.5"
                  aria-hidden="true"
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
