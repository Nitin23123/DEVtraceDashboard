const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getStats = async (token) => {
  const res = await fetch(`${API_URL}/api/dashboard/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};
