import type { MouseEventHandler } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';
import { art } from './art';

export interface ChipProps {
  label: string;
  image?: string;
  icon?: string;
  variant?: 'default' | 'image' | 'filter';
  active?: boolean;
  dropdown?: boolean;
  onClick?: MouseEventHandler;
  className?: string;
}

export function Chip({ label, image, icon, variant, active, dropdown, onClick, className }: ChipProps) {
  const v = variant || (image ? 'image' : 'default');
  return (
    <button
      type="button"
      aria-pressed={!!active}
      onClick={onClick}
      className={cn('sh-chip', v === 'image' && 'sh-chip-img', v === 'filter' && 'sh-chip-filter', className)}
    >
      {image ? <img src={art(image)} alt="" /> : null}
      {icon ? <Icon name={icon} size={18} /> : null}
      {label}
      {dropdown ? <Icon name="chevron-down" size={16} /> : null}
    </button>
  );
}
