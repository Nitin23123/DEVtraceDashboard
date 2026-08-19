import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from './Logo';
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
  { to: '/dsa', label: 'DSA Tracker', icon: I(<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 15v-3M12 15V9M17 15v-5" /></>) },
  { to: '/placements', label: 'Placement Prep', icon: I(<><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>) },
  { to: '/roadmaps', label: 'Roadmaps', icon: I(<><path d="M9 20l-5.4 2.3A1 1 0 0 1 2 21.4V6.6a1 1 0 0 1 .6-.9L9 3z" /><path d="M9 3l6 3 5.4-2.3a1 1 0 0 1 1.6.9v14.8a1 1 0 0 1-.6.9L15 21z" /><path d="M9 3v17M15 6v15" /></>) },
  { to: '/resources', label: 'Resources', icon: I(<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>) },
  { to: '/workspace', label: 'Workspace', icon: I(<><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>) },
  { to: '/snippets', label: 'Snippets', icon: I(<><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>) },
  { to: '/pomodoro', label: 'Pomodoro', icon: I(<><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path d="M5 3 2 6" /><path d="m22 6-3-3" /></>) },
  { to: '/api-tester', label: 'API Sandbox', icon: I(<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m7 10 2 2-2 2" /><path d="M12 14h4" /></>) },
  { to: '/dev-card', label: 'Dev Card', icon: I(<><rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="8" cy="12" r="2.2" /><path d="M14 10h5M14 14h3" /></>) },
  { to: '/profile', label: 'Profile', icon: I(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>) },
];

// Routes that render for logged-out visitors (and therefore for crawlers).
// Keep in sync with the public route group in App.jsx.
const PUBLIC_PATHS = new Set(['/placements', '/roadmaps', '/resources']);

const Wordmark = () => (
  <span className="flex flex-col leading-none">
    <span className="text-[17px] font-bold tracking-tight grad-text">DevTrace</span>
    <span className="mono text-[9.5px] uppercase tracking-[0.16em] mt-1" style={{ color: 'var(--muted)' }}>
      CS Student Portal
    </span>
  </span>
);

function NavList({ links, onItemClick }) {
  return (
    <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto" data-lenis-prevent>
      {links.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onItemClick}
          className="relative flex items-center gap-3 h-11 px-3 rounded-lg transition-colors"
          style={({ isActive }) =>
            isActive
              ? {
                  color: 'var(--accent)',
                  backgroundColor: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--accent) 26%, transparent)',
                }
              : { color: 'var(--text-soft)', border: '1px solid transparent' }
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full"
                  style={{ backgroundImage: 'var(--grad)' }}
                />
              )}
              <span className="shrink-0 w-5 flex justify-center">{icon}</span>
              <span className="text-[13.5px] font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarFooter({ name, email, logout }) {
  return (
    <div className="px-4 py-4 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3">
        <span
          className="shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold"
          style={{ backgroundImage: 'var(--grad)', color: 'var(--accent-fg)' }}
        >
          {(name || email || '?')[0].toUpperCase()}
        </span>
        <span className="flex flex-col leading-tight min-w-0 flex-1">
          <span className="text-[13px] font-semibold truncate" style={{ color: 'var(--text)' }}>
            {name || 'Developer'}
          </span>
          <span className="mono text-[10px] truncate" style={{ color: 'var(--muted)' }} title={email}>
            {email}
          </span>
        </span>
        <button onClick={logout} title="Log out" className="shrink-0 p-1" style={{ color: 'var(--muted)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function SignInFooter() {
  return (
    <div className="px-4 py-4 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
      <p className="text-[12px] leading-snug mb-3" style={{ color: 'var(--muted)' }}>
        Sign in to save your progress and unlock the full dashboard.
      </p>
      <Link
        to="/login"
        className="flex items-center justify-center h-9 rounded-lg text-[13px] font-semibold"
        style={{ backgroundImage: 'var(--grad)', color: 'var(--accent-fg)' }}
      >
        Sign in
      </Link>
    </div>
  );
}

const SIDEBAR = 'w-64 flex flex-col shrink-0';

const Layout = () => {
  const { user, token, logout } = useAuth();
  const { displayName } = useDisplayName();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const name = displayName || (user?.email || '').split('@')[0];

  // Logged-out visitors reach this shell only through the public routes, so
  // hide the links that would just bounce them back to /login.
  const isAuthed = Boolean(token);
  const links = isAuthed ? navLinks : navLinks.filter(({ to }) => PUBLIC_PATHS.has(to));

  const sidebarStyle = { backgroundColor: 'var(--surface)', borderRight: '1px solid var(--border)' };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile top bar */}
      <header
        className="lg:hidden sticky top-0 z-40 h-14 flex items-center justify-between px-4"
        style={{ backgroundColor: 'var(--glass)', backdropFilter: 'blur(14px)', borderBottom: '1px solid var(--border)' }}
      >
        <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="p-1.5 -ml-1.5" style={{ color: 'var(--text)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>
        <span className="flex items-center gap-2"><Logo size={24} /><span className="text-[15px] font-bold grad-text">DevTrace</span></span>
        <ThemeToggle />
      </header>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex fixed inset-y-0 left-0 z-40 ${SIDEBAR}`} style={sidebarStyle}>
        <div className="h-[72px] flex items-center gap-3 px-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <Logo size={30} />
          <Wordmark />
        </div>
        <NavList links={links} />
        <div className="px-3 pb-2">
          <ThemeToggle variant="item" />
        </div>
        {isAuthed ? <SidebarFooter name={name} email={user?.email} logout={logout} /> : <SignInFooter />}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setDrawerOpen(false)} />
          <aside className={`absolute inset-y-0 left-0 ${SIDEBAR}`} style={sidebarStyle}>
            <div className="h-[72px] flex items-center justify-between px-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="flex items-center gap-2.5"><Logo size={28} /><Wordmark /></span>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" style={{ color: 'var(--muted)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <NavList links={links} onItemClick={() => setDrawerOpen(false)} />
            <div className="px-3 pb-2"><ThemeToggle variant="item" /></div>
            {isAuthed ? <SidebarFooter name={name} email={user?.email} logout={logout} /> : <SignInFooter />}
          </aside>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 lg:pl-64 flex flex-col">
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
