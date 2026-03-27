import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const LIGHT_VARS = {
  '--bg': '#f8fafc',
  '--surface': '#ffffff',
  '--text': '#0f172a',
  '--accent': '#6366f1',
  '--border': '#e2e8f0',
};

const DARK_VARS = {
  '--bg': '#0f172a',
  '--surface': '#1e293b',
  '--text': '#f1f5f9',
  '--accent': '#6366f1',
  '--border': '#334155',
};

function applyTheme(theme) {
  const vars = theme === 'dark' ? DARK_VARS : LIGHT_VARS;
  Object.entries(vars).forEach(([k, v]) => {
    document.documentElement.style.setProperty(k, v);
  });
  document.documentElement.setAttribute('data-theme', theme);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeContext;
