import type { MouseEventHandler } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

export interface IconButtonProps {
  icon: string;
  label: string;
  badge?: number;
  size?: 'sm';
  flat?: boolean;
  onClick?: MouseEventHandler;
  className?: string;
}

export function IconButton({ icon, label, badge, size, flat, onClick, className }: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn('sh-iconbtn', flat && 'sh-iconbtn-flat', size === 'sm' && 'sh-iconbtn-sm', className)}
      aria-label={label}
      onClick={onClick}
    >
      <Icon name={icon} size={size === 'sm' ? 18 : 22} />
      {badge ? (
        <span className="sh-iconbtn-badge" aria-label={`${badge} items`}>
          {badge}
        </span>
      ) : null}
    </button>
  );
}
