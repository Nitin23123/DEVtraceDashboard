import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

/**
 * Each theme is just a map of the SAME CSS custom properties. Every component
 * reads colors via var(--bg), var(--accent), etc. — so swapping this map on
 * <html> instantly restyles the entire app with zero per-component changes.
 */
const THEMES = {
  // Default. Violet → coral on near-black, matching the marketing site.
  trace: {
    label: 'Trace',
    vars: {
      '--bg': '#0A0A0F',
      '--surface': '#101017',
      '--surface-2': '#16161F',
      '--text': '#F2F2F7',
      '--text-soft': '#B4B4C4',
      '--accent': '#A5B4FC',
      '--accent-2': '#F0A08C',
      '--accent-fg': '#0B0713',
      '--border': '#1E1E28',
      '--muted': '#8A8A9E',
      '--glass': 'rgba(16, 16, 23, 0.68)',
      '--grad': 'linear-gradient(100deg, #8B5CF6 0%, #A5B4FC 45%, #F0A08C 100%)',
    },
  },
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
      '--grad': 'linear-gradient(100deg, #22D3EE 0%, #A78BFA 100%)',
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
      '--grad': 'linear-gradient(100deg, #FFFFFF 0%, #9A9A9A 100%)',
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
      '--grad': 'linear-gradient(100deg, #0A0A0A 0%, #5A5A5A 100%)',
    },
  },
};

const ORDER = ['trace', 'neon', 'black', 'white'];

// Write every variable of the chosen theme onto the document root.
function applyTheme(key) {
  const theme = THEMES[key] || THEMES.trace;
  Object.entries(theme.vars).forEach(([name, value]) => {
    document.documentElement.style.setProperty(name, value);
  });
  document.documentElement.setAttribute('data-theme', key);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const stored = localStorage.getItem('theme');
    return THEMES[stored] ? stored : 'trace';
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
