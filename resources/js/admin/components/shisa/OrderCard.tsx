import type { MouseEvent } from 'react';
import { art } from './art';
import { Badge, type BadgeProps } from './Badge';
import { Button } from './Button';

export interface OrderCardProps {
  category?: string;
  status: string;
  tone?: BadgeProps['tone'];
  date: string;
  name: string;
  cuisine: string;
  image: string;
  total: string;
  items: number;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  actions?: boolean;
  onClick?: () => void;
}

function stop(e: MouseEvent, fn?: () => void) {
  e.stopPropagation();
  fn?.();
}

export function OrderCard({
  category,
  status,
  tone,
  date,
  name,
  cuisine,
  image,
  total,
  items,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  actions,
  onClick,
}: OrderCardProps) {
  const resolvedTone = tone || (status === 'Cancelled' ? 'danger' : status === 'Completed' ? 'success' : 'brand');
  return (
    <article
      className="sh-card sh-order"
      onClick={onClick}
      role={onClick ? 'link' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      <div className="sh-order-head">
        <span>{category || 'Food'}</span>
        <i className="sh-sep" />
        <Badge tone={resolvedTone}>{status}</Badge>
        <time>{date}</time>
      </div>
      <div className="sh-order-main">
        <span className="sh-order-media">
          <img src={art(image)} alt="" />
        </span>
        <div>
          <h3>{name}</h3>
          <span className="sh-meta">{cuisine}</span>
          <span className="sh-order-price">
            <strong>{total}</strong>
            <i className="sh-dot" />
            {items}
            {items === 1 ? ' item' : ' items'}
          </span>
        </div>
      </div>
      {actions !== false ? (
        <div className="sh-order-actions">
          <Button variant="secondary" onClick={(e) => stop(e, onSecondary)}>
            {secondaryLabel || 'View receipt'}
          </Button>
          <Button onClick={(e) => stop(e, onPrimary)}>{primaryLabel || 'Order again'}</Button>
        </div>
      ) : null}
    </article>
  );
}
