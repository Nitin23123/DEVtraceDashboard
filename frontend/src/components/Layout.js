import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 24px',
    backgroundColor: '#1e293b',
    color: 'white',
    marginBottom: '0'
  };

  const linkStyle = ({ isActive }) => ({
    color: isActive ? '#60a5fa' : 'white',
    textDecoration: 'none',
    fontWeight: isActive ? 'bold' : 'normal',
    padding: '4px 8px',
    borderRadius: '4px',
    backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent'
  });

  const mainStyle = {
    minHeight: 'calc(100vh - 48px)',
    backgroundColor: 'var(--bg)',
    color: 'var(--text)'
  };

  return (
    <div>
      <nav style={navStyle}>
        <span style={{ marginRight: 'auto', fontWeight: 'bold', fontSize: '18px' }}>DevTrackr</span>
        <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/tasks" style={linkStyle}>Tasks</NavLink>
        <NavLink to="/notes" style={linkStyle}>Notes</NavLink>
        <NavLink to="/goals" style={linkStyle}>Goals</NavLink>
        <NavLink to="/api-tester" style={linkStyle}>API Tester</NavLink>
        <NavLink to="/profile" style={linkStyle}>Profile</NavLink>
        <NavLink to="/pomodoro" style={linkStyle}>Pomodoro</NavLink>
        <NavLink to="/snippets" style={linkStyle}>Snippets</NavLink>
        <NavLink to="/dsa" style={linkStyle}>DSA</NavLink>
        <span style={{ marginLeft: 'auto', fontSize: '14px', color: '#94a3b8' }}>{user?.email}</span>
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{ background: 'none', border: '1px solid #475569', color: 'white', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
        >
          {theme === 'dark' ? '☀' : '🌙'}
        </button>
        <button
          onClick={logout}
          style={{ background: 'none', border: '1px solid #475569', color: 'white', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </nav>
      <main style={mainStyle}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
