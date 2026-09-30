import type { ReactNode } from 'react';

export interface SettingsGroupProps {
  title?: string;
  children: ReactNode;
}

export function SettingsGroup({ title, children }: SettingsGroupProps) {
  return (
    <section className="sh-card sh-settings">
      {title ? <h3>{title}</h3> : null}
      {children}
    </section>
  );
}
