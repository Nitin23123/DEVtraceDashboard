import { useTheme } from '../context/ThemeContext';

// One icon per theme — shows what's active; clicking cycles to the next.
const ICON = {
  neon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
    </svg>
  ),
  black: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  ),
  white: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ),
};

/**
 * variant="icon" — bare icon button (mobile header).
 * variant="item" — full nav-row (icon + theme-name label); pass `collapsed`
 *                  to fade the label in only on sidebar hover.
 */
export default function ThemeToggle({ className = '', variant = 'icon', collapsed = false }) {
  const { theme, label, cycleTheme } = useTheme();
  const onEnter = (e) => (e.currentTarget.style.color = 'var(--accent)');
  const onLeave = (e) => (e.currentTarget.style.color = 'var(--muted)');
  const title = `Theme: ${label} — click to switch`;

  if (variant === 'item') {
    return (
      <button
        onClick={cycleTheme}
        title={title}
        aria-label="Switch theme"
        className="relative flex items-center gap-3 h-10 px-[10px] rounded-lg transition-colors w-full"
        style={{ color: 'var(--muted)' }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <span className="shrink-0 w-5 flex justify-center">{ICON[theme] || ICON.neon}</span>
        <span className={`text-sm font-medium whitespace-nowrap ${collapsed ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}`}>
          {label}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={cycleTheme}
      title={title}
      aria-label="Switch theme"
      className={`transition-colors ${className}`}
      style={{ color: 'var(--muted)' }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {ICON[theme] || ICON.neon}
    </button>
  );
}
