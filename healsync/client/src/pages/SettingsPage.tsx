
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Toggle from '../components/ui/Toggle';
import { PageHeader, Button, Spinner } from '../components/ui';
import { useNotifications } from '../hooks/useNotifications';
import {
  Sun, Moon, Monitor, Bell,
  LogOut, Download, Trash2, ChevronRight,
  Edit3, Droplets, Activity,
  Check, ClipboardCheck 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { settings, isSaving, updateSettings, resetSettings } = useSettings();
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { requestPermission, permission, isSupported } = useNotifications();

  return (
    <div className="space-y-4 page-enter max-w-xl mx-auto pb-24 md:pb-6">
      <PageHeader title="Settings" />

      {/* PROFILE SECTION */}
      <div className="card p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-mint-100 dark:bg-mint-900/30 flex items-center justify-center text-xl font-medium text-mint-700 dark:text-mint-400">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div className="text-base font-medium text-gray-900 dark:text-white">{user?.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</div>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-0">
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5">
              <div className="text-base font-medium text-gray-800 dark:text-white">—</div>
              <div className="text-xs text-gray-400 mt-0.5">Age</div>
            </div>
            <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5">
              <div className="text-base font-medium text-gray-800 dark:text-white">—</div>
              <div className="text-xs text-gray-400 mt-0.5">cm</div>
            </div>
            <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5">
              <div className="text-base font-medium text-gray-800 dark:text-white">—</div>
              <div className="text-xs text-gray-400 mt-0.5">kg</div>
            </div>
            <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5">
              <div className="text-base font-medium text-gray-800 dark:text-white capitalize">
                —
              </div>
              <div className="text-xs text-gray-400 mt-0.5">Goal</div>
            </div>
          </div>

          <button 
            className="btn-ghost w-full mt-3 text-sm flex items-center justify-center gap-2"
            onClick={() => navigate('/onboarding')}
          >
            <Edit3 size={16} /> Edit profile
          </button>
        </div>
      </div>

      {/* APPEARANCE SECTION */}
      <div className="card p-4">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Appearance
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <div 
            onClick={() => setTheme('light')}
            className={`cursor-pointer rounded-xl border p-3 text-center transition-all ${resolvedTheme === 'light' ? 'border-mint-400 bg-mint-50 dark:bg-mint-900/20 dark:border-mint-600' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'}`}
          >
            <Sun size={20} className="text-amber-500 mx-auto mb-1" />
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Light</div>
            {resolvedTheme === 'light' && <Check size={12} className="text-mint-500 mx-auto mt-1" />}
          </div>
          <div 
            onClick={() => setTheme('dark')}
            className={`cursor-pointer rounded-xl border p-3 text-center transition-all ${resolvedTheme === 'dark' ? 'border-mint-400 bg-mint-50 dark:bg-mint-900/20 dark:border-mint-600' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'}`}
          >
            <Moon size={20} className="text-indigo-400 mx-auto mb-1" />
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Dark</div>
            {resolvedTheme === 'dark' && <Check size={12} className="text-mint-500 mx-auto mt-1" />}
          </div>
          <div 
            onClick={() => setTheme('system')}
            className={`cursor-pointer rounded-xl border p-3 text-center transition-all border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300`}
          >
            <Monitor size={20} className="text-gray-500 dark:text-gray-400 mx-auto mb-1" />
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">System</div>
          </div>
        </div>
      </div>

      {/* REMINDERS SECTION */}
      <div className="card p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-mint-500" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Reminders
            </span>
            {isSaving && <Spinner size="sm" />}
          </div>

          {permission === 'default' && isSupported && (
            <Button variant="secondary" size="sm" onClick={requestPermission}>
              Enable notifications
            </Button>
          )}
          {permission === 'granted' && (
            <span className="badge badge-green">Notifications on</span>
          )}
          {permission === 'denied' && (
            <span className="text-xs text-red-500">Blocked — enable in browser settings</span>
          )}
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          <div className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <ClipboardCheck size={16} className="text-mint-500" /> Daily check-in
              </div>
              <Toggle checked={settings.checkInEnabled} onChange={(v) => updateSettings({ checkInEnabled: v })} />
            </div>
            {settings.checkInEnabled && (
              <div className="mt-2 ml-6 flex items-center gap-2">
                <input 
                  type="time" 
                  className="input text-sm py-1 px-3 w-auto"
                  value={settings.checkInTime} 
                  onChange={(e) => updateSettings({ checkInTime: e.target.value })} 
                />
                <span className="text-xs text-gray-400">reminder</span>
              </div>
            )}
          </div>

          <div className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Droplets size={16} className="text-blue-500" /> Water reminders
              </div>
              <Toggle checked={settings.waterEnabled} onChange={(v) => updateSettings({ waterEnabled: v })} />
            </div>
            {settings.waterEnabled && (
              <div className="mt-2 ml-6 flex items-center gap-2">
                <select 
                  className="input text-sm py-1 px-3 w-auto"
                  value={settings.waterIntervalHours}
                  onChange={(e) => updateSettings({ waterIntervalHours: Number(e.target.value) })}
                >
                  <option value={1}>Every 1 hour</option>
                  <option value={2}>Every 2 hours</option>
                  <option value={3}>Every 3 hours</option>
                  <option value={4}>Every 4 hours</option>
                </select>
                <span className="text-xs text-gray-400">reminder</span>
              </div>
            )}
          </div>

          <div className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Moon size={16} className="text-indigo-500" /> Bedtime reminder
              </div>
              <Toggle checked={settings.sleepEnabled} onChange={(v) => updateSettings({ sleepEnabled: v })} />
            </div>
            {settings.sleepEnabled && (
              <div className="mt-2 ml-6 flex items-center gap-2">
                <input 
                  type="time" 
                  className="input text-sm py-1 px-3 w-auto"
                  value={settings.sleepTime} 
                  onChange={(e) => updateSettings({ sleepTime: e.target.value })} 
                />
                <span className="text-xs text-gray-400">reminder</span>
              </div>
            )}
          </div>

          <div className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Activity size={16} className="text-amber-500" /> Movement break
              </div>
              <Toggle checked={settings.stretchEnabled} onChange={(v) => updateSettings({ stretchEnabled: v })} />
            </div>
            {settings.stretchEnabled && (
              <div className="mt-2 ml-6 flex items-center gap-2">
                <input 
                  type="time" 
                  className="input text-sm py-1 px-3 w-auto"
                  value={settings.stretchTime} 
                  onChange={(e) => updateSettings({ stretchTime: e.target.value })} 
                />
                <span className="text-xs text-gray-400">reminder</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DATA SECTION */}
      <div className="card p-4">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Data
        </h2>
        <div className="space-y-1">
          <div className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Download size={16} className="text-mint-500" /> Export my data
            </div>
            <ChevronRight size={14} className="text-gray-400" />
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors" onClick={resetSettings}>
            <div className="flex items-center gap-2 text-sm text-red-500 dark:text-red-400">
              <Trash2 size={16} /> Reset health data
            </div>
            <ChevronRight size={14} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* LOGOUT */}
      <button 
        className="btn-ghost w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        onClick={() => {
          logout();
          navigate('/');
        }}
      >
        <LogOut size={16} /> Sign out
      </button>

    </div>
  );
}
