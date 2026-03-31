import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

// Black & White — dark-first theme
const DARK_VARS = {
  '--bg': '#0a0a0a',
  '--surface': '#111111',
  '--surface-2': '#1a1a1a',
  '--text': '#ffffff',
  '--accent': '#ffffff',
  '--accent-fg': '#0a0a0a',
  '--border': '#2a2a2a',
  '--muted': '#888888',
};

// Light variant
const LIGHT_VARS = {
  '--bg': '#fafafa',
  '--surface': '#ffffff',
  '--surface-2': '#f0f0f0',
  '--text': '#0a0a0a',
  '--accent': '#0a0a0a',
  '--accent-fg': '#ffffff',
  '--border': '#e0e0e0',
  '--muted': '#666666',
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
