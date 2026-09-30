import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from './Icon';

export interface BottomNavItem {
  label: string;
  icon: string;
  path: string;
  end?: boolean;
  badge?: number;
}

export interface BottomNavProps {
  items: BottomNavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
  const location = useLocation();
  return (
    <nav className="sh-bottomnav" aria-label="Main" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
      {items.map((item) => {
        const on = item.end ? location.pathname === item.path : location.pathname.startsWith(item.path);
        return (
          <NavLink key={item.label} to={item.path} end={item.end} className="sh-nav-item" aria-current={on ? 'page' : undefined}>
            <span style={{ position: 'relative' }}>
              <Icon name={item.icon} size={24} strokeWidth={on ? 2.25 : 1.75} />
              {item.badge ? (
                <span
                  className="sh-iconbtn-badge"
                  style={{ position: 'absolute', top: -6, right: -10 }}
                  aria-label={`${item.badge} items`}
                >
                  {item.badge}
                </span>
              ) : null}
            </span>
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
