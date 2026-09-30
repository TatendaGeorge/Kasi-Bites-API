import { useEffect, useState } from 'react';
import { Icon } from './Icon';

export interface StepperProps {
  value?: number;
  min?: number;
  max?: number;
  onChange?: (n: number) => void;
}

export function Stepper({ value, min = 0, max, onChange }: StepperProps) {
  const [n, setN] = useState(value ?? 1);

  useEffect(() => {
    if (value !== undefined) setN(value);
  }, [value]);

  function change(delta: number) {
    let v = Math.max(min, n + delta);
    if (max !== undefined) v = Math.min(max, v);
    setN(v);
    onChange?.(v);
  }

  return (
    <div className="sh-stepper">
      <button type="button" aria-label="Remove one" onClick={() => change(-1)}>
        <Icon name="minus" size={18} />
      </button>
      <output aria-live="polite">{n}</output>
      <button type="button" aria-label="Add one" onClick={() => change(1)}>
        <Icon name="plus" size={18} />
      </button>
    </div>
  );
}
