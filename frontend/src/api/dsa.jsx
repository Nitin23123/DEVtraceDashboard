const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

/** Days grouped with per-user completion flags. */
export const getProblems = async (token) => {
  const res = await fetch(`${API_URL}/api/dsa/problems`, { headers: authHeaders(token) });
  return res.json();
};

/** Toggles completion for one problem; resolves to { completed }. */
export const toggleProblem = async (token, problemId) => {
  const res = await fetch(`${API_URL}/api/dsa/progress/${problemId}`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  return res.json();
};
