import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatColor  = 'green' | 'blue' | 'amber' | 'red' | 'gray';
type TrendDir   = 'up' | 'down' | 'neutral';

interface StatCardProps {
  title:       string;
  value:       string | number;
  subtitle?:   string;
  icon?:       ReactNode;
  trend?:      TrendDir;
  trendValue?: string;
  color?:      StatColor;
  loading?:    boolean;
}

const colorMap: Record<StatColor, string> = {
  green: 'bg-mint-100 text-mint-600 dark:bg-mint-900/30 dark:text-mint-400',
  blue:  'bg-calm-100 text-calm-600 dark:bg-calm-900/30 dark:text-calm-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  red:   'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  gray:  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const trendColorMap: Record<TrendDir, string> = {
  up:      'text-mint-600 dark:text-mint-400',
  down:    'text-red-500',
  neutral: 'text-gray-400',
};

const TrendIcon = ({ trend }: { trend: TrendDir }) => {
  if (trend === 'up')      return <TrendingUp  size={12} />;
  if (trend === 'down')    return <TrendingDown size={12} />;
  return <Minus size={12} />;
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color   = 'gray',
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="w-20 h-3 rounded bg-gray-100 dark:bg-gray-800 mb-2" />
        <div className="w-32 h-6 rounded bg-gray-100 dark:bg-gray-800 mb-2" />
        <div className="w-16 h-3 rounded bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="card">
      {/* Top row */}
      <div className="flex justify-between items-start">
        {icon && (
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', colorMap[color])}>
            {icon}
          </div>
        )}
        <p className={cn(
          'text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide',
          icon ? 'text-right' : ''
        )}>
          {title}
        </p>
      </div>

      {/* Value */}
      <p className="text-2xl font-medium text-gray-800 dark:text-gray-100 mt-2">{value}</p>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>
      )}

      {/* Trend row */}
      {(trend || trendValue) && (
        <div className={cn('flex items-center gap-1 mt-2', trend ? trendColorMap[trend] : 'text-gray-400')}>
          {trend && <TrendIcon trend={trend} />}
          {trendValue && <span className="text-xs">{trendValue}</span>}
        </div>
      )}
    </div>
  );
}
