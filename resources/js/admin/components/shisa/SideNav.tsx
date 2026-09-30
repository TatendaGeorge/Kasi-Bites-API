import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from './Icon';

export interface SideNavItem {
  label: string;
  icon: string;
  path: string;
  end?: boolean;
}

export type SideNavEntry = SideNavItem | '-';

export interface SideNavProps {
  items: SideNavEntry[];
}

export function SideNav({ items }: SideNavProps) {
  const location = useLocation();
  return (
    <nav className="sh-sidenav" aria-label="Sections">
      {items.map((it, i) => {
        if (it === '-') return <div key={`r${i}`} className="sh-side-rule" />;
        const on = it.end ? location.pathname === it.path : location.pathname.startsWith(it.path);
        return (
          <NavLink key={it.label} to={it.path} end={it.end} className="sh-side-item" aria-current={on ? 'page' : undefined}>
            <Icon name={it.icon} />
            {it.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
