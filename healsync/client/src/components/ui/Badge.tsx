import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeColor = 'green' | 'blue' | 'amber' | 'red' | 'gray' | 'purple';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
}

const colorMap: Record<BadgeColor, string> = {
  green:  'badge-green',
  blue:   'badge-blue',
  amber:  'badge-amber',
  red:    'badge-red',
  gray:   'badge-gray',
  purple: 'badge-purple',
};

export default function Badge({ color = 'gray', children, className, ...props }: BadgeProps) {
  return (
    <span {...props} className={cn(colorMap[color], className)}>
      {children}
    </span>
  );
}
