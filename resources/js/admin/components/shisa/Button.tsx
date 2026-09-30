import type { ReactNode, MouseEventHandler } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'light';
  size?: 'sm' | 'lg';
  icon?: string;
  iconEnd?: string;
  block?: boolean;
  disabled?: boolean;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: MouseEventHandler;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size,
  icon,
  iconEnd,
  block,
  disabled,
  href,
  type,
  onClick,
  className,
  children,
}: ButtonProps) {
  const cls = cn('sh-btn', `sh-btn-${variant}`, size && `sh-btn-${size}`, block && 'sh-btn-block', className);
  const content = (
    <>
      {icon && <Icon name={icon} size={18} />}
      {children}
      {iconEnd &&
        (variant === 'light' ? (
          <span className="sh-btn-dot">
            <Icon name={iconEnd} size={14} strokeWidth={2.25} />
          </span>
        ) : (
          <Icon name={iconEnd} size={18} />
        ))}
    </>
  );

  if (href) {
    return (
      <a href={href} className={cls} onClick={onClick as MouseEventHandler<HTMLAnchorElement>}>
        {content}
      </a>
    );
  }

  return (
    <button type={type || 'button'} disabled={disabled} className={cls} onClick={onClick}>
      {content}
    </button>
  );
}
