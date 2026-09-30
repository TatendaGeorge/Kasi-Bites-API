import type { MouseEventHandler } from 'react';
import { art } from './art';

export interface CategoryTileProps {
  label: string;
  image: string;
  active?: boolean;
  onClick?: MouseEventHandler;
}

export function CategoryTile({ label, image, active, onClick }: CategoryTileProps) {
  return (
    <button type="button" className="sh-cat" aria-pressed={!!active} onClick={onClick}>
      <img src={art(image)} alt="" />
      <span>{label}</span>
    </button>
  );
}
