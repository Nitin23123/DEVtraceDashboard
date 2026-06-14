// Shared constants + tiny UI primitives for the Placements feature.

export const tabContentVariants = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, x: -8, transition: { duration: 0.12 } },
};

export const modalVariants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.14 } },
};

export const inputClass = 'w-full px-4 py-2.5 rounded-lg text-sm text-white transition focus:outline-none';
export const inputStyle = { backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' };

export const DIFFICULTY_COLOR = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' };

export const COMPANY_DIFFICULTY_COLOR = { Low: '#22c55e', Moderate: '#f59e0b', Medium: '#f59e0b', High: '#ef4444' };

export const TYPE_COLOR = {
  Product: '#8b5cf6',
  Service: '#3b82f6',
  Consulting: '#f59e0b',
  Other: '#888888',
};

export const TOPIC_COLOR = {
  DSA: '#8b5cf6',
  'DBMS/SQL': '#3b82f6',
  OOPs: '#ec4899',
  JavaScript: '#eab308',
  React: '#06b6d4',
  'System Design': '#f97316',
  'HR/Behavioral': '#22c55e',
  Aptitude: '#14b8a6',
  Project: '#a3a3a3',
  Testing: '#ef4444',
  OS: '#6366f1',
  CN: '#0ea5e9',
  Cloud: '#10b981',
  'C#/.NET': '#a855f7',
};

export function Badge({ children, color = '#888888', filled = false }) {
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
      style={
        filled
          ? { backgroundColor: color, color: '#0a0a0a' }
          : { backgroundColor: `${color}1f`, color, border: `1px solid ${color}40` }
      }
    >
      {children}
    </span>
  );
}

export function TopicChip({ topic }) {
  return <Badge color={TOPIC_COLOR[topic] || '#888888'}>{topic}</Badge>;
}

export function SectionEmpty({ text }) {
  return (
    <div className="text-center py-16" style={{ color: 'var(--muted)' }}>
      <p className="text-sm">{text}</p>
    </div>
  );
}
