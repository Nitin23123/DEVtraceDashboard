const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getTasks = async (token) => {
  const res = await fetch(`${API_URL}/api/tasks`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};

export const createTask = async (token, taskData) => {
  const res = await fetch(`${API_URL}/api/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(taskData)
  });
  return res.json();
};

export const updateTask = async (token, id, taskData) => {
  const res = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(taskData)
  });
  return res.json();
};

export const deleteTask = async (token, id) => {
  const res = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};
