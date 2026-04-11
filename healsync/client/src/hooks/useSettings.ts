import { useState, useEffect } from 'react';
import { profileApi } from '../api'
import { useBackend } from '../context/BackendContext'
import type { ReminderSettings } from '../../../shared/types';

const SETTINGS_KEY = 'healsync_settings';

const DEFAULT_SETTINGS: ReminderSettings = {
  checkInEnabled: true,
  checkInTime: '09:00',
  waterEnabled: true,
  waterIntervalHours: 2,
  sleepEnabled: false,
  sleepTime: '22:00',
  stretchEnabled: false,
  stretchTime: '15:00',
};

export function useSettings() {
  const { isOnline } = useBackend()
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) setSettings(JSON.parse(raw));
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOnline) return
    const syncFromBackend = async () => {
      try {
        await profileApi.getProfile()
        // Profile doesn't have reminders — they are
        // on the User model. Just use localStorage.
        // Backend sync happens via updateSettings.
      } catch {
        // Silent — use localStorage settings
      }
    }
    syncFromBackend()
  }, [isOnline])

  const updateSettings = async (
    updated: Partial<ReminderSettings>
  ) => {
    setIsSaving(true)
    const newSettings = { ...settings, ...updated }

    // Always save to localStorage immediately
    setSettings(newSettings)
    localStorage.setItem(
      SETTINGS_KEY, JSON.stringify(newSettings)
    )

    // Also save to backend when online
    if (isOnline) {
      try {
        await profileApi.updateReminders(newSettings)
      } catch {
        // Silent fail — localStorage already updated
      }
    }

    setIsSaving(false)
    return newSettings
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  };

  return { settings, isLoading, isSaving, updateSettings, resetSettings };
}
