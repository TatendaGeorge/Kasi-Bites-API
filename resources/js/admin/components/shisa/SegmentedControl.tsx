import { useState } from 'react';

export interface SegmentedControlProps {
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
}

export function SegmentedControl({ options, value, onChange, label }: SegmentedControlProps) {
  const [val, setVal] = useState(value || options[0]);
  return (
    <div className="sh-seg" role="group" aria-label={label || 'Mode'}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={val === o}
          onClick={() => {
            setVal(o);
            onChange?.(o);
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
