import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

/**
 * Shared dashboard primitives.
 *
 * Everything reads from the CSS custom properties set by ThemeContext, so these
 * restyle automatically when the theme changes — no per-component colors.
 */

/**
 * Overlay rendered through a portal into <body>.
 *
 * This matters: page and tab wrappers animate `y`/`x` via Framer Motion, and a
 * transformed ancestor becomes the containing block for `position: fixed`. A
 * modal rendered inline would be positioned against that wrapper instead of the
 * viewport, and would sit inside the wrapper's stacking context — so z-50 could
 * still land underneath the z-40 sidebar. Portalling to <body> avoids both.
 */
export function Modal({ open, onClose, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' } }}
        exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
        className={`w-full ${maxWidth} my-auto rounded-xl`}
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>,
    document.body
  );
}

export const Card = ({ children, className = '', style = {}, as: Tag = 'div', ...rest }) => (
  <Tag
    className={`rounded-xl ${className}`}
    style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', ...style }}
    {...rest}
  >
    {children}
  </Tag>
);

export const CardHead = ({ title, subtitle, icon, action }) => (
  <div
    className="flex items-start justify-between gap-4 px-5 py-4"
    style={{ borderBottom: '1px solid var(--border)' }}
  >
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        {icon && <span style={{ color: 'var(--accent)' }}>{icon}</span>}
        <h2 className="text-[17px] font-semibold truncate" style={{ color: 'var(--text)' }}>{title}</h2>
      </div>
      {subtitle && (
        <p className="mono text-[11px] mt-1" style={{ color: 'var(--muted)' }}>{subtitle}</p>
      )}
    </div>
    {action}
  </div>
);

export const PageHeader = ({ title, subtitle, right }) => (
  <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
    <div>
      <h1 className="text-[32px] sm:text-[38px] font-bold tracking-tight leading-tight" style={{ color: 'var(--text)' }}>
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-[15px]" style={{ color: 'var(--text-soft)' }}>{subtitle}</p>}
    </div>
    {right}
  </div>
);

export const Label = ({ children, className = '' }) => (
  <span className={`mono text-[10.5px] uppercase tracking-[0.16em] ${className}`} style={{ color: 'var(--muted)' }}>
    {children}
  </span>
);

export const Bar = ({ value, max = 100, height = 6 }) => {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, backgroundColor: 'var(--surface-2)' }}>
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, backgroundImage: 'var(--grad)' }} />
    </div>
  );
};

export const Chip = ({ children, tone }) => (
  <span
    className="mono text-[10px] px-2 py-[3px] rounded"
    style={
      tone
        ? { backgroundColor: tone.bg, color: tone.fg }
        : { backgroundColor: 'var(--surface-2)', color: 'var(--text-soft)', border: '1px solid var(--border)' }
    }
  >
    {children}
  </span>
);

export const DIFF_TONE = {
  Easy: { bg: 'rgba(74,222,128,0.12)', fg: '#4ADE80' },
  Medium: { bg: 'rgba(250,204,21,0.12)', fg: '#FACC15' },
  Hard: { bg: 'rgba(248,113,113,0.13)', fg: '#F87171' },
};

export const GradButton = ({ children, onClick, className = '', type = 'button', disabled }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 ${className}`}
    style={{ backgroundImage: 'var(--grad)', color: 'var(--accent-fg)' }}
  >
    {children}
  </button>
);

export const GhostButton = ({ children, onClick, className = '', active = false }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg mono text-[11px] font-semibold transition-colors ${className}`}
    style={
      active
        ? { backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' }
        : { backgroundColor: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--border)' }
    }
  >
    {children}
  </button>
);

export const IconTile = ({ children }) => (
  <span
    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
    style={{ backgroundColor: 'var(--surface-2)', color: 'var(--accent)' }}
  >
    {children}
  </span>
);

export const Page = ({ children, wide = false }) => (
  <div className={`${wide ? 'max-w-7xl' : 'max-w-6xl'} mx-auto px-5 sm:px-8 py-10 sm:py-12`}>{children}</div>
);
