const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const sendRequest = async (token, { method, url, headers, body }) => {
  const res = await fetch(`${API_URL}/api/tester/proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ method, url, headers, body })
  });
  return res.json();
};

export const getHistory = async (token) => {
  const res = await fetch(`${API_URL}/api/tester/history`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};
