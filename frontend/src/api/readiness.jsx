const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const authHeaders = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

export const getReadinessBenchmarks = async (token) => {
  const res = await fetch(`${API_URL}/api/placements/readiness/benchmarks`, {
    headers: authHeaders(token),
  });
  return res.json();
};

export const predictPlacementReadiness = async (token, payload) => {
  const res = await fetch(`${API_URL}/api/placements/readiness/predict`, {
    method: 'POST',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return res.json();
};
