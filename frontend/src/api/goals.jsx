const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getGoals = async (token) => {
  const res = await fetch(`${API_URL}/api/goals`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};

export const createGoal = async (token, goalData) => {
  const res = await fetch(`${API_URL}/api/goals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(goalData)
  });
  return res.json();
};

export const updateGoal = async (token, id, goalData) => {
  const res = await fetch(`${API_URL}/api/goals/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(goalData)
  });
  return res.json();
};

export const completeGoal = async (token, id) => {
  const res = await fetch(`${API_URL}/api/goals/${id}/complete`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};

export const deleteGoal = async (token, id) => {
  const res = await fetch(`${API_URL}/api/goals/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};
