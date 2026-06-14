import React, { createContext, useState, useEffect } from 'react';
import { getMe } from '../api/auth';

export const AuthContext = createContext(null);

// DEV-ONLY auth bypass. Active only on the local dev server (npm start) AND when
// REACT_APP_AUTH_BYPASS=true is set in frontend/.env. The Netlify production build
// runs with NODE_ENV=production and never sets this flag, so it is always false
// (and dead-code-eliminated) in the deployed bundle.
const DEV_BYPASS =
  process.env.NODE_ENV !== 'production' && process.env.REACT_APP_AUTH_BYPASS === 'true';
const DEV_USER = { id: 0, email: 'dev@local (auth bypassed)' };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(DEV_BYPASS ? DEV_USER : null);
  const [token, setToken] = useState(() => (DEV_BYPASS ? 'dev-bypass-token' : localStorage.getItem('token')));
  const [isLoading, setIsLoading] = useState(true);

  // On mount: validate stored token, set user if valid. Skipped entirely in bypass mode.
  useEffect(() => {
    const initAuth = async () => {
      if (DEV_BYPASS || !token) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await getMe(token);
        setUser(data.user);
      } catch {
        // Token invalid — clear it
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = (tokenValue, userValue) => {
    localStorage.setItem('token', tokenValue);
    setToken(tokenValue);
    setUser(userValue);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
