const PIN = 'M32 61C32 61 9 41 9 26A23 23 0 0 1 55 26C55 41 32 61 32 61Z';
const FL = 'M32 11.5C36.5 17.5 42.5 21 42.5 29.5C42.5 35.6 37.8 40 32 40C26.2 40 21.5 35.6 21.5 29.8C21.5 25 24.5 22.2 26.8 19.6C27.3 23.4 28.8 25.3 30.6 25.9C29.9 20.8 30.4 15.9 32 11.5Z';
const CORE = 'M32 27.5C34.7 30.2 36.3 31.9 36.3 34.4C36.3 36.7 34.4 38.2 32 38.2C29.6 38.2 27.7 36.7 27.7 34.4C27.7 32.2 29.6 30 32 27.5Z';

export interface LogoProps {
  variant?: 'lockup' | 'mark' | 'app-icon';
  size?: number;
  className?: string;
  /** Use on dark (e.g. `night`) grounds — wordmark renders in `on-night`, flame cutout in `night`. */
  reversed?: boolean;
}

export function Logo({ variant = 'lockup', size = 40, className, reversed }: LogoProps) {
  if (variant === 'app-icon') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Shisa" className={className}>
        <rect width={64} height={64} rx={14} fill="#FF5A1F" />
        <g transform="translate(32 34) scale(1.35) translate(-32 -26)">
          <path fill="#FFFFFF" d={FL} />
          <path fill="#FF5A1F" d={CORE} />
        </g>
      </svg>
    );
  }

  const mark = (
    <>
      <path fill="var(--flame)" d={PIN} />
      <path fill={reversed ? 'var(--night)' : 'var(--surface)'} d={FL} />
      <path fill="var(--flame)" d={CORE} />
    </>
  );

  if (variant === 'mark') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Shisa" className={className}>
        {mark}
      </svg>
    );
  }

  return (
    <span
      role="img"
      aria-label="Shisa"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${size * 0.12}px`,
        color: reversed ? 'var(--on-night)' : 'var(--ink)',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        {mark}
      </svg>
      <span style={{ font: `700 ${Math.round(size * 0.72)}px/1 var(--font-display)`, letterSpacing: '-0.02em' }}>
        shisa
      </span>
    </span>
  );
}
