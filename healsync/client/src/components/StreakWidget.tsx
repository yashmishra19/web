import React from 'react';
import { useStreak } from '../hooks/useStreak';
import { Card } from './ui';
import { Flame, Trophy, Calendar } from 'lucide-react';

interface StreakWidgetProps {
  compact?: boolean;
}

function StreakWidget({ compact = false }: StreakWidgetProps) {
  const { streakData, getStreakMessage } = useStreak();

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl mx-3 mb-2">
        <Flame size={18} className="text-orange-400" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
            {streakData.currentStreak} day streak
          </span>
          <span className="text-xs text-gray-400">
            {getStreakMessage(streakData.currentStreak).substring(0, 28)}
          </span>
          <div className="flex gap-0.5 mt-1">
            {streakData.weeklyCheckIns.map((checked, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${checked ? 'bg-orange-400' : 'bg-gray-200 dark:bg-gray-700'}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Flame size={20} className="text-orange-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Your streak</span>
        </div>
        <div className="badge-amber">{streakData.longestStreak} day best</div>
      </div>

      <div className="text-center py-4">
        <div className="text-5xl font-light text-orange-400 mb-1">{streakData.currentStreak}</div>
        <div className="text-sm text-gray-400">day streak</div>
      </div>

      <div className="text-center text-xs text-gray-500 mb-4">
        {getStreakMessage(streakData.currentStreak)}
      </div>

      <div>
        <div className="text-xs text-gray-400 mb-2">This week</div>
        <div className="flex justify-between w-full">
          {streakData.weeklyCheckIns.map((checked, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${checked ? 'bg-orange-400 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600'}`}>
                {checked ? <Flame size={12} className="sm:w-3.5 sm:h-3.5" /> : <span className="text-[10px] sm:text-xs">{days[i]}</span>}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400">{days[i]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="card !p-3 bg-orange-50 dark:bg-orange-900/20 shadow-none border-none">
          <Trophy size={16} className="text-orange-400 mb-1" />
          <div className="text-lg font-medium text-orange-600 dark:text-orange-400">{streakData.longestStreak}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">Best streak</div>
        </div>

        <div className="card !p-3 bg-mint-50 dark:bg-mint-900/20 shadow-none border-none">
          <Calendar size={16} className="text-mint-500 mb-1" />
          <div className="text-lg font-medium text-mint-600 dark:text-mint-400">{streakData.totalCheckIns}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">Total check-ins</div>
        </div>
      </div>
    </Card>
  );
}

export default React.memo(StreakWidget);
