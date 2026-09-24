const BASE_URL = 'http://localhost:5000';

export const getTasks = () => fetch(`${BASE_URL}/tasks`).then(async res => {
  if (!res.ok) throw new Error(await res.text());
  return res.json();
});

export const createTask = (task) => fetch(`${BASE_URL}/tasks`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(task)
}).then(async res => {
  if (!res.ok) throw new Error(await res.text());
  return res.json();
});

export const updateTask = (id, task) => fetch(`${BASE_URL}/tasks/${id}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(task)
}).then(async res => {
  if (!res.ok) throw new Error(await res.text());
  return res.json();
});

export const deleteTask = (id) => fetch(`${BASE_URL}/tasks/${id}`, {
  method: 'DELETE'
}).then(async res => {
  if (!res.ok) throw new Error(await res.text());
  return res.json();
});
