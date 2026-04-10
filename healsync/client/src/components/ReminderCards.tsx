import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import { useCheckIn } from '../hooks/useCheckIn';
import { Button } from './ui';
import { X, Droplets, Moon, Activity, ClipboardCheck } from 'lucide-react';

const ReminderCards: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { hasCheckedInToday } = useCheckIn();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('healsync_dismissed_reminders');
      if (stored) {
        setDismissed(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load dismissed reminders', e);
    }
    setMounted(true);
  }, []);

  const dismissReminder = (id: string) => {
    setDismissed((prev) => {
      const newDismissed = [...prev, id];
      try {
        sessionStorage.setItem('healsync_dismissed_reminders', JSON.stringify(newDismissed));
      } catch (e) {
        console.error('Failed to save dismissed reminders', e);
      }
      return newDismissed;
    });
  };

  if (!mounted || !settings) return null;

  const currentHour = new Date().getHours();
  
  // Parse hours from time strings
  const checkInHour = parseInt(settings.checkInTime.split(':')[0], 10);
  const stretchHour = parseInt(settings.stretchTime.split(':')[0], 10);

  const showCheckInReminder = 
    settings.checkInEnabled && 
    !hasCheckedInToday && 
    !dismissed.includes('checkin') &&
    currentHour >= checkInHour;

  const showWaterReminder = 
    settings.waterEnabled && 
    !dismissed.includes('water');

  const showSleepReminder = 
    settings.sleepEnabled && 
    !dismissed.includes('sleep') &&
    currentHour >= 20;

  const showStretchReminder =
    settings.stretchEnabled &&
    !dismissed.includes('stretch') &&
    currentHour >= stretchHour;

  const reminders = [];

  if (showCheckInReminder) {
    reminders.push(
      <div key="checkin" className="flex items-center gap-3 p-3 rounded-xl border border-mint-200 bg-mint-50 dark:bg-mint-900/20 transition-all duration-300">
        <div className="flex-shrink-0">
          <ClipboardCheck className="text-mint-500" size={24} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-mint-800 dark:text-mint-300">Time for your daily check-in</h4>
          <p className="text-xs text-mint-600 dark:text-mint-400 opacity-70">It only takes 2 minutes</p>
        </div>
        <Button size="sm" onClick={() => navigate('/checkin')} className="text-xs py-1 px-3">
          Check in now
        </Button>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-1" onClick={() => dismissReminder('checkin')}>
          <X size={16} />
        </button>
      </div>
    );
  }

  if (showWaterReminder) {
    reminders.push(
      <div key="water" className="flex items-center gap-3 p-3 rounded-xl border border-calm-200 bg-calm-50 dark:bg-calm-900/20 transition-all duration-300">
        <div className="flex-shrink-0">
          <Droplets className="text-calm-500" size={24} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-calm-800 dark:text-calm-300">Time to drink some water 💧</h4>
          <p className="text-xs text-calm-600 dark:text-calm-400 opacity-70">Stay hydrated for better energy and focus</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/checkin')} className="text-xs py-1 px-3">
          Log water
        </Button>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-1" onClick={() => dismissReminder('water')}>
          <X size={16} />
        </button>
      </div>
    );
  }

  if (showSleepReminder) {
    reminders.push(
      <div key="sleep" className="flex items-center gap-3 p-3 rounded-xl border border-purple-200 bg-purple-50 dark:bg-purple-900/20 transition-all duration-300">
        <div className="flex-shrink-0">
          <Moon className="text-purple-500" size={24} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300">Bedtime reminder 🌙</h4>
          <p className="text-xs text-purple-600 dark:text-purple-400 opacity-70">Getting to bed on time improves your wellness score</p>
        </div>
        <button 
          onClick={() => navigate('/breathing')} 
          className="text-xs py-1.5 px-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
        >
          Start wind-down
        </button>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-1" onClick={() => dismissReminder('sleep')}>
          <X size={16} />
        </button>
      </div>
    );
  }

  if (showStretchReminder) {
    reminders.push(
      <div key="stretch" className="flex items-center gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 transition-all duration-300">
        <div className="flex-shrink-0">
          <Activity className="text-amber-500" size={24} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Time to stretch or breathe 🧘</h4>
          <p className="text-xs text-amber-600 dark:text-amber-400 opacity-70">A quick 5-minute break refreshes your mind</p>
        </div>
        <button 
          onClick={() => navigate('/breathing')} 
          className="text-xs py-1.5 px-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
        >
          Start now
        </button>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-1" onClick={() => dismissReminder('stretch')}>
          <X size={16} />
        </button>
      </div>
    );
  }

  if (reminders.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {reminders}
    </div>
  );
};

export default ReminderCards;
