import { useState, useEffect } from 'react';
import { MOCK_CHECKINS } from '../mock/data';
import { useBackend } from '../context/BackendContext';
import { checkInApi } from '../api';
import { PageHeader, Card, Badge, EmptyState, SkeletonCard, DisclaimerBanner } from '../components/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CheckIn } from '../../../shared/types';

export default function MoodHistoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const { isOnline } = useBackend();
  const navigate = useNavigate();
  const [checkins, setCheckins] = useState<CheckIn[]>([]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        if (isOnline) {
          const data = await checkInApi.getAll(30)
          setCheckins(data)
        } else {
          await new Promise(r => setTimeout(r, 700))
          setCheckins(MOCK_CHECKINS)
        }
      } catch {
        setCheckins(MOCK_CHECKINS)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [isOnline]);

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto page-enter pb-24 md:pb-6">
        <PageHeader title="Mood History" subtitle="See how your mood has changed over time" />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const totalCheckins = checkins.length;
  const avgMoodStr = totalCheckins ? (checkins.reduce((s, c) => s + c.mood, 0) / totalCheckins).toFixed(1) : '0';
  const avgMood = parseFloat(avgMoodStr);
  
  let bestDay = checkins[0];
  let lowestDay = checkins[0];
  if (totalCheckins > 0) {
    checkins.forEach(c => {
      if (c.mood > bestDay.mood) bestDay = c;
      if (c.mood < lowestDay.mood) lowestDay = c;
    });
  }

  const getEmojiForMood = (m: number) => ['😔','😕','😐','🙂','😊'][Math.round(m) - 1] || '😐';
  
  const formatDate = (ds: string) => {
    const d = new Date(ds);
    return `${d.getDate()} ${(d.toLocaleString('default', { month: 'short' }))}`;
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay();
  const daysInMonth = getDaysInMonth(selectedMonth.getFullYear(), selectedMonth.getMonth());
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const prevMonth = () => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
  const nextMonth = () => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
     days.push(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), i));
  }
  
  const checkinsByDate: Record<string, CheckIn> = {};
  checkins.forEach(c => {
    const dStr = new Date(c.date).toDateString();
    if (!checkinsByDate[dStr] || new Date(checkinsByDate[dStr].date).getTime() < new Date(c.date).getTime()) {
      checkinsByDate[dStr] = c;
    }
  });

  return (
    <div className="space-y-5 page-enter max-w-2xl mx-auto pb-24 md:pb-6">
      <PageHeader title="Mood History" subtitle="See how your mood has changed over time" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="text-center py-4">
          <div className="text-3xl mb-1">{totalCheckins ? getEmojiForMood(avgMood) : '—'}</div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{totalCheckins ? `${avgMoodStr} avg` : '—'}</div>
          <div className="text-xs text-gray-400">Overall mood</div>
        </Card>
        <Card className="text-center py-4">
          <div className="text-3xl mb-1">{totalCheckins ? getEmojiForMood(bestDay.mood) : '—'}</div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{totalCheckins ? formatDate(bestDay.date) : '—'}</div>
          <div className="text-xs text-gray-400">Best day</div>
        </Card>
        <Card className="text-center py-4">
          <div className="text-3xl font-medium text-mint-600 mb-1">{totalCheckins}</div>
          <div className="text-sm text-gray-500">entries</div>
          <div className="text-xs text-gray-400">check-ins logged</div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="min-h-[40px] px-2 btn-ghost rounded-full flex items-center justify-center shrink-0">
              <ChevronLeft size={16} />
            </button>
            <div className="text-sm font-medium w-24 text-center dark:text-gray-200">
              {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
            </div>
            <button onClick={nextMonth} className="min-h-[40px] px-2 btn-ghost rounded-full flex items-center justify-center shrink-0">
              <ChevronRight size={16} />
            </button>
          </div>
          <Badge color="blue">Last 30 days</Badge>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
           {['S','M','T','W','T','F','S'].map((d, i) => (
             <div key={i} className="text-xs text-gray-400 text-center pb-2">{d}</div>
           ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
             if (!d) return <div key={i} className="w-full aspect-square min-h-[32px]" />;
             const dStr = d.toDateString();
             const cItem = checkinsByDate[dStr];
             let cellClass = "w-full aspect-square min-h-[32px] rounded-lg flex items-center justify-center text-xs cursor-default relative ";
             
             if (!cItem) {
                cellClass += "bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600";
             } else {
                if (cItem.mood === 1) cellClass += "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
                else if (cItem.mood === 2) cellClass += "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
                else if (cItem.mood === 3) cellClass += "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
                else if (cItem.mood === 4) cellClass += "bg-mint-100 text-mint-700 dark:bg-mint-900/30 dark:text-mint-400";
                else if (cItem.mood === 5) cellClass += "bg-mint-200 text-mint-800 dark:bg-mint-800/40 dark:text-mint-300";
             }
             
             const isToday = dStr === new Date().toDateString();
             if (isToday) cellClass += " ring-2 ring-mint-400 ring-offset-1 dark:ring-offset-gray-900";

             return <div key={i} className={cellClass}>{d.getDate()}</div>;
          })}
        </div>
        
        <div className="flex gap-3 flex-wrap mt-3 text-xs text-gray-400">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-200 dark:bg-red-900/40"/> Very low</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-200 dark:bg-orange-900/40"/> Low</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-200 dark:bg-yellow-900/40"/> Neutral</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-mint-100 dark:bg-mint-900/30"/> Good</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-mint-200 dark:bg-mint-800/40"/> Great</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-gray-100 dark:bg-gray-800"/> No data</div>
        </div>
      </Card>
      
      <Card>
        <div className="text-sm font-medium mb-3 dark:text-gray-200">Recent check-ins</div>
        {checkins.length === 0 ? (
          <EmptyState
            title="No check-ins yet"
            description="Complete your first daily check-in to start tracking"
            action={{ label: 'Start check-in', onClick: () => navigate('/checkin') }}
          />
        ) : (
          <div>
            {checkins.slice(0, 10).map((c, i) => {
              const bgCols = ['bg-red-100 dark:bg-red-900/30', 'bg-orange-100 dark:bg-orange-900/30', 'bg-yellow-100 dark:bg-yellow-900/30', 'bg-mint-100 dark:bg-mint-900/30', 'bg-mint-200 dark:bg-mint-800/40'];
              const textCols = ['text-red-700 dark:text-red-400', 'text-orange-700 dark:text-orange-400', 'text-yellow-700 dark:text-yellow-400', 'text-mint-700 dark:text-mint-400', 'text-mint-800 dark:text-mint-300'];
              const labels = ['Very low', 'Low', 'Neutral', 'Good', 'Great'];
              const bg = bgCols[c.mood - 1] || 'bg-gray-100 dark:bg-gray-800';
              const tc = textCols[c.mood - 1] || 'text-gray-700 dark:text-gray-400';
              const label = labels[c.mood - 1] || 'Neutral';
              
              const dateObj = new Date(c.date);
              const dayStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
              
              return (
                <div key={c.id || i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 px-1 rounded-xl transition-colors">
                  <div className={`w-9 h-9 rounded-full ${bg} ${tc} text-lg flex items-center justify-center shrink-0`}>
                    {getEmojiForMood(c.mood)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{dayStr}</div>
                    <div className="text-xs text-gray-400">
                      Wellness: {c.wellnessScore} · Sleep: {c.sleepHours}h · Stress: {c.stress}/5
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">{label}</div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
      <DisclaimerBanner />
    </div>
  );
}
