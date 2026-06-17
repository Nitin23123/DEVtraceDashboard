import { useId } from 'react';

/**
 * DevTrace mark — an ascending "growth trace": a path of connected nodes
 * climbing up-right to a glowing live node, inside a rounded badge.
 * Reads as tracking progress/growth over time. Colors come from CSS vars
 * (--accent / --accent-2) so the mark adapts to every theme. Unique
 * gradient/filter ids per instance (via useId) so multiple logos on one
 * page never collide.
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
        <linearGradient id={grad} x1="3" y1="29" x2="29" y2="3" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
        <filter id={glow} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Badge */}
      <rect
        x="1.5" y="1.5" width="29" height="29" rx="8.5"
        fill="color-mix(in srgb, var(--accent) 9%, transparent)"
        stroke={`url(#${grad})`}
        strokeWidth="1.5"
      />

      {/* Ascending growth trace */}
      <path
        d="M6.5 23 L12 17.5 L17 19.5 L21.5 13 L25.5 8"
        stroke={`url(#${grad})`}
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${glow})`}
      />

      {/* Waypoint nodes */}
      <circle cx="6.5" cy="23" r="1.5" fill={`url(#${grad})`} />
      <circle cx="12" cy="17.5" r="1.3" fill={`url(#${grad})`} />
      <circle cx="17" cy="19.5" r="1.3" fill={`url(#${grad})`} />
      <circle cx="21.5" cy="13" r="1.3" fill={`url(#${grad})`} />

      {/* Live node at the tip */}
      <circle cx="25.5" cy="8" r="3.4" fill="color-mix(in srgb, var(--accent) 22%, transparent)" />
      <circle cx="25.5" cy="8" r="2.2" fill={`url(#${grad})`} filter={`url(#${glow})`} />
    </svg>
  );
}

export default Logo;
