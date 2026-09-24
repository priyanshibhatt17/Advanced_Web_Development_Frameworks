const BASE_URL = 'http://localhost:5001';

// Get token from local storage
const getToken = () => localStorage.getItem('token');

// Helper to construct headers
const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// --- AUTHENTICATION API ---
export const loginUser = (credentials) => fetch(`${BASE_URL}/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(credentials)
}).then(async res => {
  if (!res.ok) throw new Error(await res.text());
  return res.json();
});

export const registerUser = (userData) => fetch(`${BASE_URL}/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(userData)
}).then(async res => {
  if (!res.ok) throw new Error(await res.text());
  return res.json();
});

export const getMe = () => fetch(`${BASE_URL}/me`, {
  headers: getHeaders()
}).then(async res => {
  if (!res.ok) throw new Error(await res.text());
  return res.json();
});

// --- TASKS API ---
export const getTasks = () => fetch(`${BASE_URL}/tasks`, {
  headers: getHeaders()
}).then(async res => {
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error(await res.text());
  return res.json();
});

export const createTask = (taskData) => fetch(`${BASE_URL}/tasks`, {
  method: 'POST',
  headers: getHeaders(),
  body: JSON.stringify(taskData)
}).then(async res => {
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error(await res.text());
  return res.json();
});

export const updateTask = (id, taskData) => fetch(`${BASE_URL}/tasks/${id}`, {
  method: 'PUT',
  headers: getHeaders(),
  body: JSON.stringify(taskData)
}).then(async res => {
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error(await res.text());
  return res.json();
});

export const deleteTask = (id) => fetch(`${BASE_URL}/tasks/${id}`, {
  method: 'DELETE',
  headers: getHeaders()
}).then(async res => {
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error(await res.text());
  return res.json();
});
