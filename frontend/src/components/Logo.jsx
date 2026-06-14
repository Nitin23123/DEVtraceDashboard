import { useId } from 'react';

/**
 * DevTrace mark — a glowing "signal trace" pulse inside a rounded badge.
 * Cyan→violet gradient with a soft glow. Unique gradient/filter ids per instance
 * (via useId) so multiple logos on one page never collide.
 */
export function Logo({ size = 30, className = '' }) {
  const uid = useId().replace(/:/g, '');
  const grad = `dt-grad-${uid}`;
  const glow = `dt-glow-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={`shrink-0 ${className}`}
      aria-label="DevTrace"
      role="img"
    >
      <defs>
        <linearGradient id={grad} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
        <filter id={glow} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Badge */}
      <rect
        x="1.5" y="1.5" width="29" height="29" rx="8.5"
        fill={`color-mix(in srgb, var(--accent) 9%, transparent)`}
        stroke={`url(#${grad})`}
        strokeWidth="1.5"
      />

      {/* Signal trace / pulse */}
      <path
        d="M6 16 H10 L12.5 9.5 L15.5 22 L18 13.5 L20 16 H24"
        stroke={`url(#${grad})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${glow})`}
      />

      {/* Live node */}
      <circle cx="24" cy="16" r="2.1" fill={`url(#${grad})`} filter={`url(#${glow})`} />
    </svg>
  );
}

export default Logo;
