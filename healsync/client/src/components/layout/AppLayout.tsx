import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar     from './Sidebar';
import TopBar      from './TopBar';
import MobileNav   from './MobileNav';
import MobileDrawer from './MobileDrawer';

const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/checkin':   'Daily Check-In',
  '/journal':   'Journal',
  '/breathing': 'Breathing',
  '/analytics': 'Analytics',
  '/chat':      'AI Chat',
  '/settings':  'Settings',
  '/onboarding':'Onboarding',
};

export default function AppLayout() {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const location = useLocation();

  const pageTitle = titleMap[location.pathname] ?? 'HealSync';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Desktop sidebar — flex child, self-manages responsive visibility */}
      <Sidebar />

      {/* Right side: topbar + scrollable content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          title={pageTitle}
          onMenuClick={() => setIsMobileDrawerOpen(true)}
        />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation (fixed, only shown on mobile) */}
      <MobileNav />

      {/* Mobile slide-in drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />
    </div>
  );
}
