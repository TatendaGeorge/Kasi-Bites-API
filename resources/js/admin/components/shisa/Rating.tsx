import { Icon } from './Icon';

export interface RatingProps {
  value: string;
  count?: string;
}

export function Rating({ value, count }: RatingProps) {
  return (
    <span className="sh-rating">
      <Icon name="star" size={16} filled label="Rated" />
      <strong>{value}</strong>
      {count ? <span style={{ color: 'var(--ink-muted)' }}>({count})</span> : null}
    </span>
  );
}
