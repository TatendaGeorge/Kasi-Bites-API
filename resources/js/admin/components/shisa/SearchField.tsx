import type { ChangeEventHandler } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

export interface SearchFieldProps {
  placeholder?: string;
  icon?: string;
  trailing?: string;
  sunken?: boolean;
  label?: string;
  defaultValue?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  className?: string;
}

export function SearchField({
  placeholder,
  icon,
  trailing,
  sunken,
  label,
  defaultValue,
  value,
  onChange,
  className,
}: SearchFieldProps) {
  return (
    <label className={cn('sh-search', sunken && 'sh-search-sunken', className)}>
      <Icon name={icon || 'search'} size={20} />
      <input
        type="search"
        placeholder={placeholder || 'Search kotas, shisanyama, spots…'}
        aria-label={label || 'Search'}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
      />
      {trailing ? <Icon name={trailing} size={18} /> : null}
    </label>
  );
}
