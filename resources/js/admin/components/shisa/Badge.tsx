import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

export interface BadgeProps {
  tone?: 'neutral' | 'brand' | 'mielie' | 'success' | 'danger';
  icon?: string;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = 'neutral', icon, className, children }: BadgeProps) {
  return (
    <span className={cn('sh-badge', `sh-badge-${tone}`, className)}>
      {icon ? <Icon name={icon} size={14} /> : null}
      {children}
    </span>
  );
}
