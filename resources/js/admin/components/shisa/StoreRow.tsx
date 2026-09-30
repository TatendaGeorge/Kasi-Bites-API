import type { ReactNode } from 'react';
import { art } from './art';
import { Icon } from './Icon';

export interface StoreRowProps {
  name: string;
  image: string;
  fee: string;
  cuisine: string;
  status?: ReactNode;
  chevron?: boolean;
  onClick?: () => void;
}

export function StoreRow({ name, image, fee, cuisine, status, chevron, onClick }: StoreRowProps) {
  return (
    <article
      className="sh-card sh-srow"
      onClick={onClick}
      role={onClick ? 'link' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      <img src={art(image)} alt="" />
      <div className="sh-srow-body">
        <h3>{name}</h3>
        <div className="sh-meta">
          <span className="sh-fee">{fee}</span>
          <i className="sh-dot" />
          <span>{cuisine}</span>
        </div>
        {status ? <div className="sh-meta">{status}</div> : null}
      </div>
      {chevron ? <Icon name="chevron-right" className="sh-chev" size={20} /> : null}
    </article>
  );
}
