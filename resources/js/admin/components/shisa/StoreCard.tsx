import type { MouseEvent } from 'react';
import { art } from './art';
import { Badge } from './Badge';
import { IconButton } from './IconButton';
import { Rating } from './Rating';
import { Button } from './Button';

export interface StoreCardProps {
  name: string;
  image: string;
  distance?: string;
  time?: string;
  rating?: string;
  reviews?: string;
  fee: string;
  badge?: string;
  favourite?: boolean;
  cta?: string | false;
  onAdd?: () => void;
  onFavourite?: () => void;
  onClick?: () => void;
  width?: string;
}

function stop(e: MouseEvent, fn?: () => void) {
  e.stopPropagation();
  fn?.();
}

export function StoreCard({
  name,
  image,
  distance,
  time,
  rating,
  reviews,
  fee,
  badge,
  favourite,
  cta,
  onAdd,
  onFavourite,
  onClick,
  width,
}: StoreCardProps) {
  return (
    <article
      className="sh-card sh-store"
      style={{ ...(width ? { width } : undefined), cursor: onClick ? 'pointer' : undefined }}
      onClick={onClick}
      role={onClick ? 'link' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="sh-store-media">
        <img src={art(image)} alt="" />
        {badge ? (
          <span className="sh-store-badge">
            <Badge tone="mielie">{badge}</Badge>
          </span>
        ) : null}
        {favourite !== undefined ? (
          <span className="sh-store-fav">
            <IconButton icon="heart" size="sm" label={`Save ${name}`} onClick={(e) => stop(e, onFavourite)} />
          </span>
        ) : null}
        {distance || time ? (
          <span className="sh-store-tab">{[distance, time].filter(Boolean).join(' · ')}</span>
        ) : null}
      </div>
      <div className="sh-store-body">
        <h3>{name}</h3>
        <div className="sh-meta">
          {rating ? <Rating value={rating} count={reviews} /> : null}
          <span className="sh-fee">{fee}</span>
        </div>
      </div>
      {cta !== false ? (
        <Button size="sm" onClick={(e) => stop(e, onAdd)}>
          {cta || 'Add to order'}
        </Button>
      ) : null}
    </article>
  );
}
