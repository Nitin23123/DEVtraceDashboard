import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tasks',     label: 'Tasks' },
  { to: '/notes',     label: 'Notes' },
  { to: '/goals',     label: 'Goals' },
  { to: '/api-tester', label: 'API Tester' },
  { to: '/profile',   label: 'Profile' },
  { to: '/pomodoro',  label: 'Pomodoro' },
  { to: '/snippets',  label: 'Snippets' },
  { to: '/dsa',       label: 'DSA' },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded text-sm font-medium transition-colors ${
      isActive
        ? 'bg-white/20 text-white font-semibold'
        : 'text-slate-300 hover:text-white hover:bg-white/10'
    }`;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      {/* Top nav bar */}
      <nav className="bg-slate-900 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-40 shadow-lg">
        {/* Brand */}
        <span className="font-bold text-lg text-white mr-2 shrink-0">DevTrackr</span>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1 flex-1 flex-wrap">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} className={linkClass}>{label}</NavLink>
          ))}
        </div>

        {/* Spacer on desktop */}
        <div className="hidden lg:block flex-1" />

        {/* User email */}
        <span className="hidden lg:block text-xs text-slate-400 shrink-0 max-w-[160px] truncate">{user?.email}</span>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-1.5 rounded border border-slate-600 text-base hover:border-slate-400 transition-colors shrink-0"
        >
          {theme === 'dark' ? '☀' : '🌙'}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="hidden lg:block px-3 py-1.5 rounded border border-slate-600 text-sm text-slate-300 hover:text-white hover:border-slate-400 transition-colors shrink-0"
        >
          Logout
        </button>

        {/* Hamburger (mobile/tablet) */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="lg:hidden p-1.5 rounded border border-slate-600 text-lg hover:border-slate-400 transition-colors ml-auto"
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="lg:hidden bg-slate-800 px-4 py-3 flex flex-col gap-1 z-30 shadow-md">
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
          <div className="border-t border-slate-700 pt-2 mt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">{user?.email}</span>
            <button onClick={logout} className="text-sm text-slate-300 hover:text-white">Logout</button>
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
