import { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell
} from 'recharts';
import {
  PageHeader, SkeletonCard, StatCard, EmptyState, Button
} from '../components/ui';
import {
  Moon, Smile, Zap, Heart, AlertCircle
} from 'lucide-react';
import type { TimeSeriesPoint } from '../../../shared/types';

type Range = '7d' | '14d' | '30d';

function formatChartDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function getTrend(points: TimeSeriesPoint[]): 'up' | 'down' | 'neutral' {
  if (!points || points.length < 6) return 'neutral';
  const first3 = points.slice(0, 3).reduce((sum, p) => sum + p.value, 0) / 3;
  const last3 = points.slice(-3).reduce((sum, p) => sum + p.value, 0) / 3;
  const diff = last3 - first3;
  if (diff > 0.2) return 'up';
  if (diff < -0.2) return 'down';
  return 'neutral';
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>('14d');
  const { data, isLoading, error } = useAnalytics(range);

  const ranges: { value: Range; label: string }[] = [
    { value: '7d', label: '7 days' },
    { value: '14d', label: '14 days' },
    { value: '30d', label: '30 days' },
  ];

  let avgMood = '0.0';
  let avgSleep = '0.0';
  let avgStress = '0.0';
  let avgWellness = 0;

  let moodTrend: 'up' | 'down' | 'neutral' = 'neutral';
  let sleepTrend: 'up' | 'down' | 'neutral' = 'neutral';
  let stressTrend: 'up' | 'down' | 'neutral' = 'neutral';
  let wellnessTrend: 'up' | 'down' | 'neutral' = 'neutral';

  if (data) {
    avgMood = (data.mood.reduce((acc, curr) => acc + curr.value, 0) / data.mood.length).toFixed(1);
    avgSleep = (data.sleep.reduce((acc, curr) => acc + curr.value, 0) / data.sleep.length).toFixed(1);
    avgStress = (data.stress.reduce((acc, curr) => acc + curr.value, 0) / data.stress.length).toFixed(1);
    avgWellness = Math.round(data.wellness.reduce((acc, curr) => acc + curr.value, 0) / data.wellness.length);

    moodTrend = getTrend(data.mood);
    sleepTrend = getTrend(data.sleep);
    
    const rawStressTrend = getTrend(data.stress);
    if (rawStressTrend === 'up') stressTrend = 'down';
    else if (rawStressTrend === 'down') stressTrend = 'up';
    else stressTrend = 'neutral';

    wellnessTrend = getTrend(data.wellness);
  }

  if (error) {
    return (
      <div className="card mt-12 max-w-sm mx-auto border-red-100 bg-red-50 dark:bg-red-900/20 text-center py-8">
        <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
        <div className="text-sm font-medium text-red-700">Something went wrong</div>
        <div className="text-xs text-red-500 mb-4">{error.message || 'Unknown error'}</div>
        <Button variant="secondary" onClick={() => window.location.reload()}>Try again</Button>
      </div>
    );
  }

  if (!isLoading && !data) {
    return (
      <div className="space-y-6 page-enter pb-10 mt-6 max-w-4xl mx-auto">
        <PageHeader title="Analytics" subtitle="Track your health and wellbeing trends over time" />
        <EmptyState title="No analytics data" description="Start logging check-ins to see your trends over time." />
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter pb-10 mt-6 max-w-4xl mx-auto">
      <PageHeader
        title="Analytics"
        subtitle="Track your health and wellbeing trends over time"
      />

      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        {ranges.map(r => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
              range === r.value
                ? 'bg-mint-500 text-white border-transparent'
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-mint-300 hover:text-mint-600'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
           title="Avg Mood"
           value={`${avgMood} / 5`}
           icon={<Smile size={18}/>}
           color="green"
           trend={moodTrend}
           trendValue="vs start of period"
           loading={isLoading}
        />
        <StatCard
           title="Avg Sleep"
           value={`${avgSleep} hrs`}
           icon={<Moon size={18}/>}
           color="blue"
           trend={sleepTrend}
           trendValue="nightly average"
           loading={isLoading}
        />
        <StatCard
           title="Avg Stress"
           value={`${avgStress} / 5`}
           icon={<Zap size={18}/>}
           color="amber"
           trend={stressTrend}
           trendValue="lower is better"
           loading={isLoading}
        />
        <StatCard
           title="Avg Wellness"
           value={avgWellness.toString()}
           icon={<Heart size={18}/>}
           color="green"
           trend={wellnessTrend}
           trendValue="wellness score"
           loading={isLoading}
        />
      </div>

      {/* CHART 1 — Mood Over Time */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Smile className="w-4 h-4 text-mint-500" />
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Mood trend</h2>
        </div>
        {isLoading || !data ? <SkeletonCard lines={5} /> : (
          <>
            <div style={{ height: 200, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.mood.map(p => ({
                  date: formatChartDate(p.date),
                  value: p.value
                }))}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
                  <XAxis dataKey="date" tick={{fontSize:11}}
                         axisLine={false} tickLine={false}
                         interval="preserveStartEnd"/>
                  <YAxis domain={[1,5]} ticks={[1,2,3,4,5]} hide/>
                  <Tooltip
                    formatter={(v: any) => [v, 'Mood']}
                    contentStyle={{borderRadius:'12px',border:'none',
                                   boxShadow:'0 4px 12px rgba(0,0,0,0.1)',
                                   fontSize:'12px'}}
                  />
                  <ReferenceLine y={3} stroke="#94a3b8" strokeDasharray="4 4"/>
                  <Area type="monotone" dataKey="value"
                        stroke="#22c55e" strokeWidth={2}
                        fill="url(#moodGrad)" dot={false}
                        activeDot={{r:4, fill:'#22c55e'}}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>😔 1</span>
              <span>😊 5</span>
            </div>
          </>
        )}
      </div>

      {/* CHART 2 — Sleep Over Time */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Moon className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sleep trend</h2>
        </div>
        {isLoading || !data ? <SkeletonCard lines={5} /> : (
          <>
            <div style={{ height: 200, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.sleep.map(p => ({
                  date: formatChartDate(p.date),
                  hours: p.value
                }))} barSize={range === '30d' ? 8 : 16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
                  <XAxis dataKey="date" tick={{fontSize:11}}
                         axisLine={false} tickLine={false}
                         interval="preserveStartEnd"/>
                  <YAxis domain={[0,12]} hide/>
                  <Tooltip
                    formatter={(v: any) => [`${v} hrs`, 'Sleep']}
                    contentStyle={{borderRadius:'12px',border:'none',
                                   boxShadow:'0 4px 12px rgba(0,0,0,0.1)',
                                   fontSize:'12px'}}
                  />
                  <ReferenceLine y={8} stroke="#94a3b8" strokeDasharray="4 4"
                                 label={{value:'Goal',position:'right',
                                         fontSize:10,fill:'#94a3b8'}}/>
                  <Bar dataKey="hours" radius={[4,4,0,0]}>
                    {data.sleep.map((entry, i) => (
                      <Cell key={i}
                        fill={entry.value >= 7 ? '#3b82f6'
                            : entry.value >= 5 ? '#f59e0b' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Good (7+ hrs)</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Fair (5–7 hrs)</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#ef4444]" /> Low (&lt; 5 hrs)</span>
            </div>
          </>
        )}
      </div>

      {/* CHART 3 — Stress Trend */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Stress trend</h2>
        </div>
        <div className="text-xs text-gray-400 mb-3">Lower is better — aim to keep stress below 3</div>
        {isLoading || !data ? <SkeletonCard lines={5} /> : (
          <div style={{ height: 200, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.stress.map(p => ({
                date: formatChartDate(p.date),
                value: p.value
              }))}>
                <defs>
                  <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
                <XAxis dataKey="date" tick={{fontSize:11}}
                       axisLine={false} tickLine={false}
                       interval="preserveStartEnd"/>
                <YAxis domain={[1,5]} hide/>
                <Tooltip
                  formatter={(v: any) => [v, 'Stress']}
                  contentStyle={{borderRadius:'12px',border:'none',
                                 boxShadow:'0 4px 12px rgba(0,0,0,0.1)',
                                 fontSize:'12px'}}
                />
                <ReferenceLine y={3} stroke="#94a3b8" strokeDasharray="4 4"/>
                <Area type="monotone" dataKey="value"
                      stroke="#f59e0b" strokeWidth={2}
                      fill="url(#stressGrad)" dot={false}
                      activeDot={{r:4, fill:'#f59e0b'}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* CHART 4 — Wellness Score Trend */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Wellness score trend</h2>
        </div>
        {isLoading || !data ? <SkeletonCard lines={5} /> : (
          <div style={{ height: 200, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.wellness.map(p => ({
                date: formatChartDate(p.date),
                score: p.value
              }))}>
                <defs>
                  <linearGradient id="wellnessGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
                <XAxis dataKey="date" tick={{fontSize:11}}
                       axisLine={false} tickLine={false}
                       interval="preserveStartEnd"/>
                <YAxis domain={[0,100]} hide/>
                <Tooltip
                  formatter={(v: any) => [v, 'Wellness score']}
                  contentStyle={{borderRadius:'12px',border:'none',
                                 boxShadow:'0 4px 12px rgba(0,0,0,0.1)',
                                 fontSize:'12px'}}
                />
                <ReferenceLine y={75} stroke="#22c55e" strokeDasharray="4 4"
                               label={{value:'Great',position:'right',
                                       fontSize:10,fill:'#22c55e'}}/>
                <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="4 4"
                               label={{value:'Fair',position:'right',
                                       fontSize:10,fill:'#f59e0b'}}/>
                <Area type="monotone" dataKey="score"
                      stroke="#3b82f6" strokeWidth={2}
                      fill="url(#wellnessGrad)" dot={false}
                      activeDot={{r:4,fill:'#3b82f6'}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
