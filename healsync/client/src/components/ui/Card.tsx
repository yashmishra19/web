import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?:   boolean;
  padding?: CardPadding;
}

const paddingMap: Record<CardPadding, string> = {
  none: 'p-0',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-7',
};

export default function Card({
  hover   = false,
  padding = 'md',
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        hover ? 'card-hover' : 'card',
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
