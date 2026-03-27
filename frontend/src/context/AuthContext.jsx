import React, { createContext, useState, useEffect } from 'react';
import { getMe } from '../api/auth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // On mount: validate stored token, set user if valid
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
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
  }, []); // Run once on mount only

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
