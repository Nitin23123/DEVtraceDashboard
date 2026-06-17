import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

/**
 * Each theme is just a map of the SAME CSS custom properties. Every component
 * reads colors via var(--bg), var(--accent), etc. — so swapping this map on
 * <html> instantly restyles the entire app with zero per-component changes.
 */
const THEMES = {
  neon: {
    label: 'Neon',
    vars: {
      '--bg': '#070A12',
      '--surface': '#0D1320',
      '--surface-2': '#141C2E',
      '--text': '#E7F0FF',
      '--text-soft': '#9FB2CE',
      '--accent': '#22D3EE',
      '--accent-2': '#A78BFA',
      '--accent-fg': '#04070D',
      '--border': '#1E2A40',
      '--muted': '#647389',
      '--glass': 'rgba(14, 21, 36, 0.6)',
    },
  },
  // Pure black & white — monochrome (grayscale only, no hue).
  black: {
    label: 'Black',
    vars: {
      '--bg': '#0A0A0A',
      '--surface': '#141414',
      '--surface-2': '#1F1F1F',
      '--text': '#FFFFFF',
      '--text-soft': '#B8B8B8',
      '--accent': '#FFFFFF',
      '--accent-2': '#9A9A9A',
      '--accent-fg': '#0A0A0A',
      '--border': '#2A2A2A',
      '--muted': '#787878',
      '--glass': 'rgba(20, 20, 20, 0.62)',
    },
  },
  white: {
    label: 'White',
    vars: {
      '--bg': '#F6F6F6',
      '--surface': '#FFFFFF',
      '--surface-2': '#ECECEC',
      '--text': '#0A0A0A',
      '--text-soft': '#3F3F3F',
      '--accent': '#0A0A0A',
      '--accent-2': '#5A5A5A',
      '--accent-fg': '#FFFFFF',
      '--border': '#E3E3E3',
      '--muted': '#767676',
      '--glass': 'rgba(255, 255, 255, 0.72)',
    },
  },
};

const ORDER = ['neon', 'black', 'white'];

// Write every variable of the chosen theme onto the document root.
function applyTheme(key) {
  const theme = THEMES[key] || THEMES.neon;
  Object.entries(theme.vars).forEach(([name, value]) => {
    document.documentElement.style.setProperty(name, value);
  });
  document.documentElement.setAttribute('data-theme', key);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const stored = localStorage.getItem('theme');
    return THEMES[stored] ? stored : 'neon';
  });

  // Apply + persist whenever the active theme changes.
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (key) => { if (THEMES[key]) setThemeState(key); };
  const cycleTheme = () => setThemeState((t) => ORDER[(ORDER.indexOf(t) + 1) % ORDER.length]);

  return (
    <ThemeContext.Provider
      value={{ theme, label: THEMES[theme].label, themes: THEMES, order: ORDER, setTheme, cycleTheme, toggleTheme: cycleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeContext;
