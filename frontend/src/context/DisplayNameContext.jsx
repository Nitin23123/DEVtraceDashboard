import { createContext, useContext, useState, useCallback } from 'react';

/**
 * Display name stored entirely client-side in localStorage — no backend/DB.
 * Per-device (not synced across browsers). Falls back to the email prefix
 * wherever it's consumed when empty.
 */
const KEY = 'dt_display_name';
const DisplayNameContext = createContext(null);

export function DisplayNameProvider({ children }) {
  const [displayName, setName] = useState(() => localStorage.getItem(KEY) || '');

  const setDisplayName = useCallback((value) => {
    const trimmed = (value || '').trim().slice(0, 40);
    if (trimmed) localStorage.setItem(KEY, trimmed);
    else localStorage.removeItem(KEY);
    setName(trimmed);
  }, []);

  return (
    <DisplayNameContext.Provider value={{ displayName, setDisplayName }}>
      {children}
    </DisplayNameContext.Provider>
  );
}

export function useDisplayName() {
  const ctx = useContext(DisplayNameContext);
  if (!ctx) throw new Error('useDisplayName must be used within DisplayNameProvider');
  return ctx;
}
