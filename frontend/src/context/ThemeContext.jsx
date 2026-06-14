import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

// "Neon Grid" — deep blue-black with cyan + violet neon accents and glassy panels. Dark-first.
const DARK_VARS = {
  '--bg': '#070A12',
  '--surface': '#0D1320',
  '--surface-2': '#141C2E',
  '--text': '#E7F0FF',
  '--text-soft': '#9FB2CE',
  '--accent': '#22D3EE',     // neon cyan
  '--accent-2': '#A78BFA',   // neon violet
  '--accent-fg': '#04070D',
  '--border': '#1E2A40',
  '--muted': '#647389',
  '--glass': 'rgba(14, 21, 36, 0.6)',
};

// Cool light variant.
const LIGHT_VARS = {
  '--bg': '#F1F5FB',
  '--surface': '#FFFFFF',
  '--surface-2': '#E9F0F8',
  '--text': '#0B1220',
  '--text-soft': '#3A4658',
  '--accent': '#0891B2',
  '--accent-2': '#7C3AED',
  '--accent-fg': '#FFFFFF',
  '--border': '#D7E0EE',
  '--muted': '#697686',
  '--glass': 'rgba(255, 255, 255, 0.6)',
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
