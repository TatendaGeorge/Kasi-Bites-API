import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A labeled text input styled with Shisa tokens. The design system doesn't define a
 * generic form-input component (its screens don't have auth/settings forms), so this
 * is a small local extension that stays consistent with the token set: `radius-md`,
 * `line`/`line-strong` borders, `focus` ring.
 */
export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  trailing?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, trailing, className, id, ...props }, ref) => {
    const inputId = id || `field-${label.replace(/\s+/g, '-').toLowerCase()}`;
    return (
      <div>
        <label
          htmlFor={inputId}
          style={{ display: 'block', font: '700 13px/18px var(--font-body)', color: 'var(--ink-muted)', marginBottom: 8 }}
        >
          {label}
        </label>
        <div style={{ position: 'relative' }}>
          <input
            ref={ref}
            id={inputId}
            className={cn(className)}
            style={{
              width: '100%',
              background: 'var(--surface)',
              border: `1px solid ${error ? 'var(--danger)' : 'var(--line-strong)'}`,
              borderRadius: 'var(--radius-md)',
              padding: trailing ? '14px 44px 14px 16px' : '14px 16px',
              font: '400 15px/22px var(--font-body)',
              color: 'var(--ink)',
              outline: 'none',
            }}
            {...props}
          />
          {trailing ? (
            <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
              {trailing}
            </div>
          ) : null}
        </div>
        {error ? (
          <p style={{ marginTop: 6, font: '400 13px/18px var(--font-body)', color: 'var(--danger)' }}>{error}</p>
        ) : null}
      </div>
    );
  }
);
TextField.displayName = 'TextField';
