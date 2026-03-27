const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getNotes = async (token) => {
  const res = await fetch(`${API_URL}/api/notes`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};

export const createNote = async (token, noteData) => {
  const res = await fetch(`${API_URL}/api/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(noteData)
  });
  return res.json();
};

export const updateNote = async (token, id, noteData) => {
  const res = await fetch(`${API_URL}/api/notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(noteData)
  });
  return res.json();
};

export const deleteNote = async (token, id) => {
  const res = await fetch(`${API_URL}/api/notes/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};
