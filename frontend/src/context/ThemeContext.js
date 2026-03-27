import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const LIGHT_VARS = {
  '--bg': '#ffffff',
  '--surface': '#f5f5f5',
  '--text': '#000000',
  '--accent': '#000000',
  '--accent-fg': '#ffffff',
  '--border': '#e0e0e0',
  '--muted': '#6b6b6b',
};

const DARK_VARS = {
  '--bg': '#000000',
  '--surface': '#111111',
  '--text': '#ffffff',
  '--accent': '#ffffff',
  '--accent-fg': '#000000',
  '--border': '#222222',
  '--muted': '#888888',
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
