import { useState, useEffect } from 'react';
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

  const updateSettings = async (updated: Partial<ReminderSettings>) => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 400));
    const newSettings = { ...settings, ...updated };
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    setIsSaving(false);
    return newSettings;
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  };

  return { settings, isLoading, isSaving, updateSettings, resetSettings };
}
