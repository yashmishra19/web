import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { useStreak } from '../hooks/useStreak';
import StreakWidget from '../components/StreakWidget';
import ReminderCards from '../components/ReminderCards';
import { MOCK_USER } from '../mock/data';
import {
  Flame,
  Smile,
  Moon,
  Droplets,
  Zap,
  Activity,
  Heart,
  Apple,
  Wind,
  Target,
  ClipboardCheck,
  BookOpen,
  BarChart2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';

import {
  ProgressRing,
  StatCard,
  SkeletonCard,
  EmptyState,
} from '../components/ui';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { data, isLoading, error } = useDashboard();
  const { streakData } = useStreak();

  const user = authUser || MOCK_USER;

  const currentHour = new Date().getHours();
  let timeOfDay = 'evening';
  if (currentHour >= 5 && currentHour < 12) timeOfDay = 'morning';
  else if (currentHour >= 12 && currentHour < 17) timeOfDay = 'afternoon';

  const hasCheckedInToday = data?.hasCheckedInToday ?? false;
  const streakCount = streakData.currentStreak;

  const score = data?.wellnessScore || 0;
  let scoreColor = '#ef4444';
  if (score >= 75) scoreColor = '#22c55e';
  else if (score >= 50) scoreColor = '#f59e0b';

  const status = data?.wellnessStatus || 'stable';
  let statusBadge = 'badge-blue';
  let statusLabel = 'Stable';
  if (status === 'improving') {
    statusBadge = 'badge-green';
    statusLabel = 'Improving';
  } else if (status === 'needs_attention') {
    statusBadge = 'badge-amber';
    statusLabel = 'Needs attention';
  }

  const moodEmojis = ['', '😔', '😕', '😐', '🙂', '😊'];
  const moodLabels = ['', 'Very low', 'Low', 'Neutral', 'Good', 'Great'];
  const todayMood = data?.todayMood ?? null;

  const lastSleep = data?.sleepLast7Days?.[6] || 0;
  const isSleepGood = lastSleep >= 7;

  const waterToday = data?.waterToday || 0;
  const remainingWater = Math.max(0, 2.5 - waterToday).toFixed(1);
  const isWaterGood = waterToday >= 2.5;

  const sleepData = data?.sleepLast7Days?.map((val, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    hours: val,
    target: 8
  })) || [];

  const stressToday = data?.stressToday || 1;
  const activityToday = data?.activityToday || 0;
  const activityTarget = 30;
  const activityPercent = Math.min((activityToday / activityTarget) * 100, 100);

  const getStressDetails = (level: number) => {
    let text = "Low — you're doing well";
    if (level === 1) text = "Very low — great job!";
    else if (level === 2) text = "Low — you're doing well";
    else if (level === 3) text = "Moderate — take a breath";
    else if (level === 4) text = "High — consider a break";
    else if (level === 5) text = "Very high — please rest";

    return text;
  };

  const categoryMap: Record<string, { icon: React.FC<any>; color: string }> = {
    sleep: { icon: Moon, color: 'bg-blue-100 text-blue-600' },
    hydration: { icon: Droplets, color: 'bg-blue-100 text-blue-600' },
    activity: { icon: Activity, color: 'bg-green-100 text-green-600' },
    stress: { icon: Wind, color: 'bg-amber-100 text-amber-600' },
    mental_health: { icon: Heart, color: 'bg-purple-100 text-purple-600' },
    nutrition: { icon: Apple, color: 'bg-green-100 text-green-600' },
    focus: { icon: Target, color: 'bg-blue-100 text-blue-600' }
  };

  const getActionRoute = (label: string) => {
    if (label.includes('breathing')) return '/breathing';
    if (label.toLowerCase().includes('journal')) return '/journal';
    if (label.includes('water')) return '/settings';
    return '/checkin';
  };

  if (error) {
    return (
      <div className="card mt-12 max-w-sm mx-auto border-red-100 bg-red-50 dark:bg-red-900/20 text-center py-8">
        <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
        <div className="text-sm font-medium text-red-700">Something went wrong</div>
        <div className="text-xs text-red-500 mb-4">{error}</div>
        <button className="btn-secondary" onClick={() => window.location.reload()}>Try again</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter pb-10">
      {/* SECTION 1 — Welcome Header */}
      <div className="bg-gradient-to-r from-mint-500 to-mint-600 dark:from-mint-700 dark:to-mint-800 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-medium">
            Good {timeOfDay}, {user?.name} 👋
          </h1>
          <p className="text-sm opacity-80 mt-1">
            {hasCheckedInToday
              ? "You have checked in today. Keep it up!"
              : "You haven't checked in yet today."}
          </p>
          {!hasCheckedInToday && (
            <button
              onClick={() => navigate('/checkin')}
              className="bg-white text-mint-700 font-medium text-sm px-4 py-2 rounded-xl mt-3 hover:bg-mint-50 transition-colors"
            >
              Log today's check-in →
            </button>
          )}
        </div>
        <div className="hidden md:flex bg-white/20 rounded-xl px-4 py-2 items-center gap-2">
          <Flame size={16} />
          <span className="text-sm font-medium text-white">{streakCount} day streak</span>
        </div>
      </div>

      <ReminderCards />
      
      <StreakWidget />

      {/* SECTION 2 — Wellness Score + Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card col-span-2 md:col-span-1 flex flex-col items-center justify-center py-6">
          <ProgressRing
            value={score}
            size={100}
            strokeWidth={8}
            color={scoreColor}
            label={score.toString()}
            sublabel="/ 100"
          />
          <div className="text-xs text-gray-400 mt-3">Wellness Score</div>
          <div className={`mt-1 ${statusBadge}`}>{statusLabel}</div>
        </div>

        <StatCard
          title="Mood today"
          value={todayMood !== null ? moodEmojis[todayMood] : '—'}
          subtitle={todayMood !== null ? moodLabels[todayMood] : 'Not logged yet'}
          icon={<Smile size={18} />}
          color="green"
          loading={isLoading}
        />

        <StatCard
          title="Sleep last night"
          value={`${lastSleep} hrs`}
          subtitle={isSleepGood ? 'Good rest' : 'Below target'}
          icon={<Moon size={18} />}
          color={isSleepGood ? 'blue' : 'amber'}
          trend={isSleepGood ? 'up' : 'down'}
          trendValue="vs 7hr goal"
          loading={isLoading}
        />

        <StatCard
          title="Water today"
          value={`${waterToday} L`}
          subtitle={isWaterGood ? 'Goal reached!' : `${remainingWater}L to go`}
          icon={<Droplets size={18} />}
          color={isWaterGood ? 'green' : 'blue'}
          trend={isWaterGood ? 'up' : 'neutral'}
          trendValue="2.5L daily goal"
          loading={isLoading}
        />
      </div>

      {/* SECTION 3 — Sleep Trend Chart */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sleep this week</h2>
          <span className="badge-blue">Last 7 days</span>
        </div>

        {isLoading ? (
          <SkeletonCard lines={4} />
        ) : (
          <>
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sleepData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 12]} hide />
                  <Tooltip
                    formatter={(value: any) => [`${value} hrs`, 'Sleep']}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontSize: '12px'
                    }}
                    cursor={{ fill: 'transparent' }}
                  />
                  <ReferenceLine y={8} stroke="#94a3b8" strokeDasharray="4 4" />
                  <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                    {sleepData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.hours >= 7 ? '#22c55e' : entry.hours >= 5 ? '#f59e0b' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#22c55e]" /> Good (7+ hrs)</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Fair (5–7 hrs)</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#ef4444]" /> Low (&lt; 5 hrs)</span>
            </div>
          </>
        )}
      </div>

      {/* SECTION 4 — Stress + Activity Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card A — Stress Indicator */}
        <div className="card flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Stress level today</span>
          </div>

          {isLoading ? (
            <div className="mt-4"><SkeletonCard lines={2} /></div>
          ) : (
            <div className="mt-auto pt-4">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((level) => {
                  let barColor = 'bg-gray-100 dark:bg-gray-800';
                  if (level <= stressToday) {
                    if (stressToday <= 2) barColor = 'bg-mint-400';
                    else if (stressToday === 3) barColor = 'bg-yellow-400';
                    else barColor = 'bg-red-400';
                  }
                  return <div key={level} className={`flex-1 h-3 rounded-full ${barColor}`} />;
                })}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Low</span>
                <span>High</span>
              </div>
              <div className="text-sm font-medium mt-3 text-gray-800 dark:text-gray-200">
                {getStressDetails(stressToday)}
              </div>
            </div>
          )}
        </div>

        {/* Card B — Activity */}
        <div className="card flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Activity today</span>
          </div>

          {isLoading ? (
            <SkeletonCard lines={2} />
          ) : (
            <div className="flex flex-col items-center">
              <ProgressRing
                value={activityPercent}
                size={80}
                color={activityPercent >= 100 ? '#22c55e' : '#3b82f6'}
                label={activityToday.toString()}
                sublabel="min"
                strokeWidth={6}
              />
              <div className="text-xs text-gray-400 text-center mt-2">
                {activityToday} / {activityTarget} min goal
              </div>
              {activityToday >= activityTarget && (
                <div className="badge-green mt-2">Goal reached! 🎉</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 5 — Personalized Recommendations */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-medium text-gray-800 dark:text-gray-200">Recommendations for you</h2>
          <span className="text-xs text-mint-600 hover:text-mint-700 cursor-pointer">View all</span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </div>
        ) : !data?.recommendations?.length ? (
          <EmptyState
            title="No recommendations yet"
            description="Complete your daily check-in to get personalised suggestions"
            action={{ label: 'Start check-in', onClick: () => navigate('/checkin') }}
          />
        ) : (
          <div className="space-y-3">
            {data.recommendations.map((rec) => {
              const { icon: CatIcon, color } = categoryMap[rec.category] || categoryMap.focus;
              return (
                <div key={rec.id} className="card hover:shadow-card-hover transition-shadow cursor-default flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
                      <CatIcon size={16} />
                    </div>
                    {rec.priority === 'high' && <span className="badge-red">High priority</span>}
                    {rec.priority === 'medium' && <span className="badge-amber">Medium</span>}
                    {rec.priority === 'low' && <span className="badge-green">Low</span>}
                  </div>

                  {rec.supportFlag && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 mt-1 flex gap-2 items-start">
                      <Heart size={14} className="text-purple-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-purple-700 dark:text-purple-300">
                        We noticed your mood has been lower lately. You're not alone — consider talking to someone you trust.
                      </span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">{rec.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">{rec.description}</p>
                  </div>

                  {rec.actionLabel && (
                    <span
                      onClick={() => navigate(getActionRoute(rec.actionLabel || ''))}
                      className="text-xs text-mint-600 font-medium mt-1 cursor-pointer hover:text-mint-700 w-fit"
                    >
                      → {rec.actionLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 6 — Quick Actions */}
      <div>
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div
            className="bg-mint-50 dark:bg-mint-900/20 border border-mint-100 dark:border-mint-800 rounded-2xl p-4 cursor-pointer hover:bg-mint-100 dark:hover:bg-mint-900/30 transition-colors"
            onClick={() => navigate('/checkin')}
          >
            <ClipboardCheck className="w-6 h-6 text-mint-600 mb-2" />
            <div className="text-sm font-medium text-mint-800 dark:text-mint-300">Daily Check-In</div>
            <div className="text-xs text-mint-600/70 mt-0.5">Log how you feel</div>
          </div>

          <div
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            onClick={() => navigate('/breathing')}
          >
            <Wind className="w-6 h-6 text-blue-600 mb-2" />
            <div className="text-sm font-medium text-blue-800 dark:text-blue-300">Breathing</div>
            <div className="text-xs text-blue-600/70 mt-0.5">5-min exercise</div>
          </div>

          <div
            className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl p-4 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            onClick={() => navigate('/journal')}
          >
            <BookOpen className="w-6 h-6 text-purple-600 mb-2" />
            <div className="text-sm font-medium text-purple-800 dark:text-purple-300">Journal</div>
            <div className="text-xs text-purple-600/70 mt-0.5">Write your thoughts</div>
          </div>

          <div
            className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl p-4 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            onClick={() => navigate('/analytics')}
          >
            <BarChart2 className="w-6 h-6 text-amber-600 mb-2" />
            <div className="text-sm font-medium text-amber-800 dark:text-amber-300">Analytics</div>
            <div className="text-xs text-amber-600/70 mt-0.5">See your trends</div>
          </div>

          <div
            className="bg-gradient-to-br from-mint-50 to-calm-50 dark:from-mint-900/20 dark:to-calm-900/20 border border-mint-100 dark:border-mint-800 rounded-2xl p-4 cursor-pointer hover:shadow-card-hover transition-all"
            onClick={() => navigate('/chat')}
          >
            <Sparkles className="w-6 h-6 text-mint-500 mb-2" />
            <div className="text-sm font-medium text-gray-800 dark:text-gray-100">AI Assistant</div>
            <div className="text-xs opacity-70 dark:text-gray-400">Ask anything</div>
            <div className="badge-amber mt-1 text-[10px] px-1.5 py-0.5">Beta</div>
          </div>
        </div>
      </div>
    </div>
  );
}
