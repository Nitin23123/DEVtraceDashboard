import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Logo } from './Logo';
import Footer from './Footer';
import { useDisplayName } from '../context/DisplayNameContext';
import ThemeToggle from './ThemeToggle';

const I = (paths) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {paths}
  </svg>
);

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: I(<><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>) },
  { to: '/workspace', label: 'Workspace', icon: I(<><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>) },
  { to: '/dsa', label: 'DSA', icon: I(<><path d="M3 12h4l3 8 4-16 3 8h4" /></>) },
  { to: '/placements', label: 'Placements', icon: I(<><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>) },
  { to: '/pomodoro', label: 'Pomodoro', icon: I(<><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path d="M5 3 2 6" /><path d="m22 6-3-3" /></>) },
  { to: '/snippets', label: 'Snippets', icon: I(<><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>) },
  { to: '/api-tester', label: 'API', icon: I(<><path d="m13 2-3 7h5l-3 7" /></>) },
  { to: '/profile', label: 'Profile', icon: I(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>) },
];

const itemStyle = ({ isActive }) =>
  isActive
    ? { color: 'var(--accent)', backgroundColor: 'color-mix(in srgb, var(--accent) 12%, transparent)' }
    : { color: 'var(--muted)' };

const glassPanel = {
  backgroundColor: 'var(--glass)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
};

const Wordmark = () => (
  <span className="text-base font-semibold tracking-tight whitespace-nowrap">
    <span style={{ color: 'var(--text-soft)' }}>dev</span>
    <span style={{ background: 'linear-gradient(120deg, var(--accent), var(--accent-2))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>trace</span>
  </span>
);

function NavList({ collapsed = false, onItemClick }) {
  return (
    <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
      {navLinks.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          title={label}
          onClick={onItemClick}
          className="relative flex items-center gap-3 h-10 px-[10px] rounded-lg transition-colors"
          style={itemStyle}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-full" style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
              )}
              <span className="shrink-0 w-5 flex justify-center">{icon}</span>
              <span className={`text-sm font-medium whitespace-nowrap ${collapsed ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}`}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarFooter({ collapsed = false, name, email, logout }) {
  return (
    <div className="px-3 py-3 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3 h-10 px-[10px]">
        <span
          className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold"
          style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 18%, transparent)', color: 'var(--accent)' }}
        >
          {(name || email || '?')[0].toUpperCase()}
        </span>
        <span title={email} className={`text-xs truncate flex-1 ${collapsed ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}`} style={{ color: 'var(--muted)' }}>
          {name || email}
        </span>
        <button
          onClick={logout}
          title="Logout"
          className={`shrink-0 ${collapsed ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}`}
          style={{ color: 'var(--muted)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const Layout = () => {
  const { user, logout } = useAuth();
  const { displayName } = useDisplayName();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const name = displayName || (user?.email || '').split('@')[0];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile top bar */}
      <header
        className="lg:hidden sticky top-0 z-40 h-14 flex items-center justify-between px-4"
        style={{ ...glassPanel, borderBottom: '1px solid var(--border)' }}
      >
        <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="p-1.5 -ml-1.5" style={{ color: 'var(--text)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>
        <span className="flex items-center gap-2"><Logo size={24} /><Wordmark /></span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span
            className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 18%, transparent)', color: 'var(--accent)' }}
          >
            {(name || '?')[0].toUpperCase()}
          </span>
        </div>
      </header>

      {/* Desktop collapsible icon rail */}
      <aside
        className="hidden lg:flex group fixed inset-y-0 left-0 z-40 w-[64px] hover:w-56 overflow-hidden transition-[width] duration-200 ease-out flex-col"
        style={{ ...glassPanel, borderRight: '1px solid var(--border)' }}
      >
        <div className="h-14 flex items-center gap-3 px-[17px] shrink-0">
          <Logo size={30} />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity"><Wordmark /></span>
        </div>
        <div className="px-3 pb-2 mb-1" style={{ borderBottom: '1px solid var(--border)' }}>
          <ThemeToggle variant="item" collapsed />
        </div>
        <NavList collapsed />
        <SidebarFooter collapsed name={name} email={user?.email} logout={logout} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 flex flex-col" style={{ ...glassPanel, borderRight: '1px solid var(--border)' }}>
            <div className="h-14 flex items-center justify-between px-4 shrink-0">
              <span className="flex items-center gap-2.5"><Logo size={28} /><Wordmark /></span>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" style={{ color: 'var(--muted)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <NavList onItemClick={() => setDrawerOpen(false)} />
            <SidebarFooter name={name} email={user?.email} logout={logout} />
          </aside>
        </div>
      )}

      {/* Content (rail width reserved on desktop only) */}
      <div className="flex-1 lg:pl-[64px] flex flex-col">
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
