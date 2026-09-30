import { Icon } from './Icon';
import { Toggle } from './Toggle';

export interface SettingsRowProps {
  icon?: string;
  title: string;
  subtitle?: string;
  toggle?: boolean;
  onChange?: (on: boolean) => void;
  onClick?: () => void;
}

export function SettingsRow({ icon, title, subtitle, toggle, onChange, onClick }: SettingsRowProps) {
  const isToggle = toggle !== undefined;
  const trailing = isToggle ? (
    <Toggle checked={toggle} label={title} onChange={onChange} />
  ) : (
    <Icon name="chevron-right" className="sh-chev" size={20} />
  );

  const inner = (
    <>
      <Icon name={icon || 'circle-user'} />
      <div>
        <strong>{title}</strong>
        {subtitle ? <small>{subtitle}</small> : null}
      </div>
      {trailing}
    </>
  );

  if (isToggle) {
    return <div className="sh-settings-row">{inner}</div>;
  }
  return (
    <button type="button" className="sh-settings-row" onClick={onClick}>
      {inner}
    </button>
  );
}
