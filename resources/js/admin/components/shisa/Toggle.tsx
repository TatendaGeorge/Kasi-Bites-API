import { useEffect, useState } from 'react';

export interface ToggleProps {
  checked?: boolean;
  label: string;
  onChange?: (on: boolean) => void;
}

export function Toggle({ checked, label, onChange }: ToggleProps) {
  const [on, setOn] = useState(!!checked);

  useEffect(() => {
    if (checked !== undefined) setOn(checked);
  }, [checked]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className="sh-toggle"
      onClick={() => {
        setOn(!on);
        onChange?.(!on);
      }}
    />
  );
}
