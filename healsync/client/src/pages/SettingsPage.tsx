import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PageHeader, Card, Button, Badge, Toggle, Spinner, DisclaimerBanner, useToastContext, EmptyState } from '../components/ui';
import { Bell, Moon, Sun, Monitor, Trash2, Download, LogOut, ChevronRight, Clock, Droplets, Activity, RefreshCw, Check, ClipboardCheck, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { settings, isLoading, isSaving, updateSettings, resetSettings } = useSettings();
  const { user, logout } = useAuth();
  const profileStr = localStorage.getItem('healsync_profile');
  const profile = profileStr ? JSON.parse(profileStr) : null;
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { showToast } = useToastContext();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const handleExportData = () => {
    const exportData = {
      user: localStorage.getItem('healsync_user'),
      profile: localStorage.getItem('healsync_profile'),
      checkins: localStorage.getItem('healsync_checkins'),
      journal: localStorage.getItem('healsync_journal'),
      settings: localStorage.getItem('healsync_settings'),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'healsync-data.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully', 'success');
  };

  const handleResetData = () => {
    localStorage.removeItem('healsync_checkins');
    localStorage.removeItem('healsync_journal');
    localStorage.removeItem('healsync_settings');
    localStorage.removeItem('healsync_breath_sessions');
    resetSettings();
    setShowResetConfirm(false);
    showToast('All health data has been reset', 'info');
  };

  const handleDeleteAccount = () => {
    localStorage.clear();
    logout();
    navigate('/signup');
  };

  return (
    <div className="space-y-5 page-enter max-w-2xl mx-auto pb-8">
      <PageHeader
        title="Settings"
        subtitle="Manage your preferences and account"
      />

      <Card>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-mint-100 dark:bg-mint-900/30 flex items-center justify-center text-2xl font-medium text-mint-700">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="text-lg font-medium text-gray-800 dark:text-gray-100">{user?.name || 'User'}</div>
            <div className="text-sm text-gray-400">{user?.email || 'user@example.com'}</div>
            <Badge color="green" className="ml-0 mt-1">
              <Flame size={12} className="mr-1 inline-block" /> {user?.streakCount || 0} day streak
            </Badge>
          </div>
        </div>

        <div className="h-px bg-gray-200 dark:bg-gray-800 w-full mt-4 mb-4" />

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-medium text-gray-800 dark:text-gray-100">{profile?.age ? `${profile.age}yrs` : '—'}</div>
            <div className="text-xs text-gray-400">Age</div>
          </div>
          <div>
            <div className="text-lg font-medium text-gray-800 dark:text-gray-100">{profile?.heightCm ? `${profile.heightCm} cm` : '—'}</div>
            <div className="text-xs text-gray-400">Height</div>
          </div>
          <div>
            <div className="text-lg font-medium text-gray-800 dark:text-gray-100">{profile?.weightKg ? `${profile.weightKg} kg` : '—'}</div>
            <div className="text-xs text-gray-400">Weight</div>
          </div>
        </div>

        <Button variant="secondary" className="w-full mt-4" onClick={() => navigate('/onboarding')} rightIcon={<ChevronRight size={16} />}>
          Edit profile
        </Button>
      </Card>

      <Card>
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Appearance</div>
        <div className="grid grid-cols-3 gap-3">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <div
              key={t}
              onClick={() => setTheme(t)}
              className={`cursor-pointer rounded-xl border p-3 text-center transition-all duration-150 ${
                theme === t
                  ? 'border-mint-400 bg-mint-50 dark:bg-mint-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-mint-300'
              }`}
            >
              {t === 'light' && <Sun size={32} className="mx-auto mb-2 text-amber-500" />}
              {t === 'dark' && <Moon size={32} className="mx-auto mb-2 text-calm-500" />}
              {t === 'system' && <Monitor size={32} className="mx-auto mb-2 text-gray-500" />}
              
              <div className="text-xs font-medium capitalize">{t}</div>
              {theme === t && <Check size={12} className="text-mint-600 mx-auto mt-1" />}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Bell size={18} className="text-mint-500" />
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Reminders</div>
          {isSaving && <Spinner size="sm" className="ml-auto" />}
        </div>
        <div className="text-xs text-gray-400 mb-4">
          In-app reminders show as cards on your dashboard. Browser notifications require permission.
        </div>

        <div className="space-y-4">
          {/* Row 1 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardCheck size={20} className="text-mint-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily check-in reminder</span>
              </div>
              <Toggle checked={settings.checkInEnabled} onChange={() => updateSettings({ checkInEnabled: !settings.checkInEnabled })} />
            </div>
            {settings.checkInEnabled && (
              <div className="flex items-center gap-2 ml-7 mt-1">
                <Clock size={14} className="text-gray-400" />
                <input
                  type="time"
                  className="input text-sm py-1.5 w-auto"
                  value={settings.checkInTime}
                  onChange={(e) => updateSettings({ checkInTime: e.target.value })}
                />
                <span className="text-xs text-gray-400">reminder time</span>
              </div>
            )}
          </div>

          {/* Row 2 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets size={20} className="text-calm-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Water reminder</span>
              </div>
              <Toggle checked={settings.waterEnabled} onChange={() => updateSettings({ waterEnabled: !settings.waterEnabled })} />
            </div>
            {settings.waterEnabled && (
              <div className="flex items-center gap-2 ml-7 mt-1">
                <span className="text-xs text-gray-400">Every</span>
                <select
                  className="input text-sm py-1.5 w-auto"
                  value={settings.waterIntervalHours}
                  onChange={(e) => updateSettings({ waterIntervalHours: Number(e.target.value) })}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                </select>
                <span className="text-xs text-gray-400">hours</span>
              </div>
            )}
          </div>

          {/* Row 3 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon size={20} className="text-purple-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sleep reminder</span>
              </div>
              <Toggle checked={settings.sleepEnabled} onChange={() => updateSettings({ sleepEnabled: !settings.sleepEnabled })} />
            </div>
            {settings.sleepEnabled && (
              <div className="flex items-center gap-2 ml-7 mt-1">
                <Clock size={14} className="text-gray-400" />
                <input
                  type="time"
                  className="input text-sm py-1.5 w-auto"
                  value={settings.sleepTime}
                  onChange={(e) => updateSettings({ sleepTime: e.target.value })}
                />
                <span className="text-xs text-gray-400">reminder time</span>
              </div>
            )}
          </div>

          {/* Row 4 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={20} className="text-amber-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Stretch & breathing reminder</span>
              </div>
              <Toggle checked={settings.stretchEnabled} onChange={() => updateSettings({ stretchEnabled: !settings.stretchEnabled })} />
            </div>
            {settings.stretchEnabled && (
              <div className="flex items-center gap-2 ml-7 mt-1">
                <Clock size={14} className="text-gray-400" />
                <input
                  type="time"
                  className="input text-sm py-1.5 w-auto"
                  value={settings.stretchTime}
                  onChange={(e) => updateSettings({ stretchTime: e.target.value })}
                />
                <span className="text-xs text-gray-400">reminder time</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Your goal</div>
        {profile?.mainGoal ? (
          <div>
            <div className="bg-mint-50 dark:bg-mint-900/20 rounded-xl p-3 flex items-center justify-between mb-2">
              <span className="font-medium text-mint-800 dark:text-mint-400 capitalize">{profile.mainGoal.replace('-', ' ')}</span>
              <Badge color="green">Active</Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/onboarding')}>
              Change goal
            </Button>
          </div>
        ) : (
          <EmptyState
            title="No goal set"
            action={{ label: 'Set a goal', onClick: () => navigate('/onboarding') }}
          />
        )}
      </Card>

      <Card>
        <div className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">Data & Privacy</div>
        <div className="space-y-3">
          <div
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            onClick={handleExportData}
          >
            <div className="flex items-center gap-2">
              <Download size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Export my data</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>

          <div
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            onClick={() => setShowResetConfirm(true)}
          >
            <div className="flex items-center gap-2">
              <RefreshCw size={16} className="text-amber-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Reset all health data</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
          {showResetConfirm && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mt-3 border border-amber-200 dark:border-amber-800">
              <div className="text-sm font-medium text-amber-800 dark:text-amber-400 mb-1">Reset all health data?</div>
              <div className="text-xs text-amber-700 dark:text-amber-500/80 mb-3">
                This will delete all your check-ins, journal entries, and recommendations. Your account will remain.
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowResetConfirm(false)} className="text-amber-800 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40">Cancel</Button>
                <Button size="sm" onClick={handleResetData} className="bg-amber-500 hover:bg-amber-600 text-white border-transparent">Reset data</Button>
              </div>
            </div>
          )}

          <div
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <div className="flex items-center gap-2">
              <Trash2 size={16} className="text-red-500" />
              <span className="text-sm text-red-500">Delete account</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
          {showDeleteConfirm && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mt-3 border border-red-200 dark:border-red-800">
              <div className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">Delete account?</div>
              <div className="text-xs text-red-700 dark:text-red-500/80 mb-3">
                This will permanently delete your account and all data.
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)} className="text-red-800 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40">Cancel</Button>
                <Button variant="danger" size="sm" onClick={handleDeleteAccount}>Delete account</Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-mint-500 flex items-center justify-center text-white font-bold">
            H
          </div>
          <div>
            <div className="font-medium text-gray-800 dark:text-gray-100">HealSync</div>
            <div className="text-xs text-gray-400">v1.0.0 · Built for wellbeing</div>
          </div>
        </div>
        <DisclaimerBanner />
        <Button
          variant="ghost"
          className="w-full mt-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          leftIcon={<LogOut size={16} />}
        >
          Sign out
        </Button>
      </Card>
    </div>
  );
}
