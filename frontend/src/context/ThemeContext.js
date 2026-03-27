import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

// Midnight Indigo — dark-first theme
const DARK_VARS = {
  '--bg': '#0f0f23',
  '--surface': '#1a1a3e',
  '--text': '#ffffff',
  '--accent': '#ffffff',
  '--accent-fg': '#0f0f23',
  '--border': '#2d2d5a',
  '--muted': '#8b8baf',
};

// Light variant — soft indigo tint
const LIGHT_VARS = {
  '--bg': '#f5f5ff',
  '--surface': '#ffffff',
  '--text': '#0f0f23',
  '--accent': '#4c1d95',
  '--accent-fg': '#ffffff',
  '--border': '#c4b5fd',
  '--muted': '#6b7280',
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
    return 'dark'; // Midnight Indigo is dark-first
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
