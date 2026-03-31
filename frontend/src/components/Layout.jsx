import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tasks',     label: 'Tasks' },
  { to: '/notes',     label: 'Notes' },
  { to: '/goals',     label: 'Goals' },
  { to: '/api-tester', label: 'API' },
  { to: '/profile',   label: 'Profile' },
  { to: '/pomodoro',  label: 'Pomodoro' },
  { to: '/snippets',  label: 'Snippets' },
  { to: '/dsa',       label: 'DSA' },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${
      isActive
        ? 'text-white bg-white/10'
        : 'text-[--muted] hover:text-white hover:bg-white/5'
    }`;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>

      {/* Top nav */}
      <nav
        className="sticky top-0 z-40 h-14 flex items-center px-6 gap-6"
        style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        {/* Brand */}
        <span className="font-semibold text-sm tracking-widest uppercase text-white shrink-0">
          DevTrackr
        </span>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1 flex-1">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} className={linkClass}>{label}</NavLink>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-4 ml-auto">
          <span className="text-xs max-w-[160px] truncate" style={{ color: 'var(--muted)' }}>
            {user?.email}
          </span>
          <button
            onClick={logout}
            className="px-3 py-1.5 text-sm rounded-md border transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = '#555'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            Logout
          </button>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="lg:hidden ml-auto p-1.5 rounded-md transition-colors"
          style={{ color: 'var(--muted)' }}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="lg:hidden flex flex-col px-6 py-4 gap-1 z-30"
          style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
        >
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={linkClass}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          <div className="pt-3 mt-2 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>{user?.email}</span>
            <button onClick={logout} className="text-sm" style={{ color: 'var(--muted)' }}>Logout</button>
          </div>
        </div>
      )}

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
