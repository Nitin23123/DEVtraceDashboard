const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

const qs = (params = {}) => {
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '');
  return entries.length ? `?${new URLSearchParams(entries).toString()}` : '';
};

export const getCompanies = async (token) => {
  const res = await fetch(`${API_URL}/api/placements/companies`, { headers: authHeaders(token) });
  return res.json();
};

export const getCompany = async (token, slug) => {
  const res = await fetch(`${API_URL}/api/placements/companies/${slug}`, { headers: authHeaders(token) });
  return res.json();
};

export const getExperiences = async (token, params) => {
  const res = await fetch(`${API_URL}/api/placements/experiences${qs(params)}`, { headers: authHeaders(token) });
  return res.json();
};

export const createExperience = async (token, body) => {
  const res = await fetch(`${API_URL}/api/placements/experiences`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
};

export const getQuestions = async (token, params) => {
  const res = await fetch(`${API_URL}/api/placements/questions${qs(params)}`, { headers: authHeaders(token) });
  return res.json();
};

export const getTopics = async (token) => {
  const res = await fetch(`${API_URL}/api/placements/topics`, { headers: authHeaders(token) });
  return res.json();
};

export const getPrep = async (token, slug) => {
  const res = await fetch(`${API_URL}/api/placements/prep/${slug}`, { headers: authHeaders(token) });
  return res.json();
};

export const getHrQuestions = async (token) => {
  const res = await fetch(`${API_URL}/api/placements/hr-questions`, { headers: authHeaders(token) });
  return res.json();
};

export const getCalendar = async (token) => {
  const res = await fetch(`${API_URL}/api/placements/calendar`, { headers: authHeaders(token) });
  return res.json();
};

export const getInsights = async (token) => {
  const res = await fetch(`${API_URL}/api/placements/insights`, { headers: authHeaders(token) });
  return res.json();
};
