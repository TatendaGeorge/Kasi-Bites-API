import { IconButton } from './IconButton';
import { Icon } from './Icon';

export interface MobileHeaderProps {
  location?: string;
  cart?: number;
  onSearchClick?: () => void;
  onCartClick?: () => void;
  onLocationClick?: () => void;
}

export function MobileHeader({ location, cart, onSearchClick, onCartClick, onLocationClick }: MobileHeaderProps) {
  return (
    <div className="sh-mhead">
      <IconButton icon="search" label="Search" onClick={onSearchClick} />
      <button
        type="button"
        className="sh-mhead-loc"
        onClick={onLocationClick}
        style={{ border: 0, background: 'none', cursor: onLocationClick ? 'pointer' : 'default' }}
      >
        <small>Current location</small>
        <strong>
          <Icon name="map-pin" size={16} />
          {location || 'Vilakazi St, Orlando West'}
        </strong>
      </button>
      <IconButton icon="shopping-cart" label="Cart" badge={cart} onClick={onCartClick} />
    </div>
  );
}
