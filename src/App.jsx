import { useState, useEffect } from 'react'
import { getTasks, createTask, updateTask, deleteTask } from './api'
import './App.css'

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      {message}
    </div>
  );
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError('Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const newTask = await createTask({ title, description, priority, completed: false });
      setTasks(prev => [...prev, newTask]);
      setTitle('');
      setDescription('');
      setPriority('medium');
      showToast('Task added successfully!');
    } catch (err) {
      showToast('Failed to add task', 'error');
    }
  };

  const handleToggleComplete = async (task) => {
    const updatedTask = { ...task, completed: !task.completed };
    setTasks(prev => prev.map(t => t._id === task._id ? updatedTask : t));
    try {
      await updateTask(task._id, updatedTask);
    } catch (err) {
      setTasks(prev => prev.map(t => t._id === task._id ? task : t));
      showToast('Failed to update task', 'error');
    }
  };

  const handleDelete = async (id) => {
    const prevTasks = [...tasks];
    setTasks(prev => prev.filter(t => t._id !== id));
    try {
      await deleteTask(id);
      showToast('Task deleted successfully!');
    } catch (err) {
      setTasks(prevTasks);
      showToast('Failed to delete task', 'error');
    }
  };

  return (
    <div className="container">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon"></div>
          <h1>Task Manager</h1>
        </div>
      </header>

      <form onSubmit={handleCreate} className="task-form">
        <input 
          type="text" 
          placeholder="Task Title" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required 
        />
        <input 
          type="text" 
          placeholder="Description (Optional)" 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
        />
        <select value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <button type="submit">Add Task</button>
      </form>

      {loading && <div className="loading">Loading tasks...</div>}
      {error && <div className="error">{error}</div>}
      
      {!loading && !error && tasks.length === 0 && (
        <div className="empty-state">No tasks yet. Add one above!</div>
      )}

      <div className="task-list">
        {tasks.map(task => (
          <div key={task._id} className={`task-card priority-${task.priority} ${task.completed ? 'completed' : ''}`}>
            <div className="task-info">
              <h3>
                {task.title || "Untitled Task"}
                <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
              </h3>
              {task.description && <p>{task.description}</p>}
            </div>
            <div className="task-actions">
              <button onClick={() => handleToggleComplete(task)} className="complete-btn">
                {task.completed ? 'Undo' : 'Complete'}
              </button>
              <button onClick={() => handleDelete(task._id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
