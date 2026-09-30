import type { ChangeEventHandler } from 'react';
import { Logo } from './Logo';
import { SearchField } from './SearchField';
import { IconButton } from './IconButton';
import { Icon } from './Icon';

export interface TopBarProps {
  location?: string;
  cart?: number;
  onCartClick?: () => void;
  onLocationClick?: () => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: ChangeEventHandler<HTMLInputElement>;
  onLogoClick?: () => void;
}

export function TopBar({
  location,
  cart,
  onCartClick,
  onLocationClick,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  onLogoClick,
}: TopBarProps) {
  return (
    <header className="sh-topbar">
      <button
        type="button"
        onClick={onLogoClick}
        style={{ border: 0, background: 'none', padding: 0, cursor: onLogoClick ? 'pointer' : 'default' }}
      >
        <Logo size={34} />
      </button>
      <button type="button" className="sh-loc" onClick={onLocationClick}>
        <Icon name="map-pin" size={20} />
        <span>
          <small>Deliver to</small>
          {location || 'Vilakazi St, Orlando West'}
        </span>
        <Icon name="chevron-down" size={16} />
      </button>
      <SearchField sunken placeholder={searchPlaceholder} value={searchValue} onChange={onSearchChange} />
      <IconButton icon="shopping-cart" label="Cart" badge={cart} flat onClick={onCartClick} />
    </header>
  );
}
