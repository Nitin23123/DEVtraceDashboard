const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Register a new user.
 * @returns { token, user } on success
 * @throws Error with message on failure
 */
export const register = async (email, password) => {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
};

/**
 * Log in an existing user.
 * @returns { token, user } on success
 * @throws Error with message on failure
 */
export const loginRequest = async (email, password) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
};

/**
 * Get the current user from a valid token.
 * @returns { user } on success
 * @throws Error on 401
 */
export const getMe = async (token) => {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Token invalid or expired');
  return res.json();
};
