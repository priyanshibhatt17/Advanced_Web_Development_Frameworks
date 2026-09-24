import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { getTasks, createTask, updateTask, deleteTask, getMe, loginUser, registerUser } from './api';
import './App.css';

// Lazy loaded components (Practical 8)
const LandingPage = lazy(() => import('./LandingPage'));
const Stats = lazy(() => import('./pages/Stats'));

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return <div className={`toast toast-${type}`}>{message}</div>;
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  
  const [toast, setToast] = useState(null);

  // Auth UI state
  const [showAuthView, setShowAuthView] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => {
    if (token) {
      loadUserData();
    } else {
      setTasks([]);
      setUser(null);
    }
  }, [token]);

  const handleAuthError = (err) => {
    if (err.message === 'Unauthorized' || String(err.message).includes('401')) {
      handleLogout();
      showToast('Session expired. Please log in again.', 'error');
    } else {
      let msg = err.message;
      try { msg = JSON.parse(err.message).error || err.message; } catch(e){}
      showToast(msg, 'error');
    }
  };

  const loadUserData = async () => {
    setLoading(true);
    try {
      const userData = await getMe();
      setUser(userData);
      const tasksData = await getTasks();
      setTasks(tasksData);
      setError(null);
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLoginView) {
        const data = await loginUser({ email: authEmail, password: authPassword });
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setShowAuthView(false);
        showToast('Logged in successfully!');
      } else {
        await registerUser({ email: authEmail, password: authPassword });
        showToast('Registered successfully! Please log in.');
        setIsLoginView(true);
      }
      setAuthEmail('');
      setAuthPassword('');
    } catch (err) {
      let msg = err.message;
      try { msg = JSON.parse(err.message).error || err.message; } catch(e){}
      showToast(msg, 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setShowAuthView(false);
    showToast('Logged out successfully');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newTaskData = { title, description, priority, completed: false };
    const tempId = Date.now().toString();
    const optimisticTask = { ...newTaskData, _id: tempId };
    setTasks(prev => [...prev, optimisticTask]);
    setTitle('');
    setDescription('');
    setPriority('medium');

    try {
      const createdTask = await createTask(newTaskData);
      setTasks(prev => prev.map(t => t._id === tempId ? createdTask : t));
      showToast('Task created successfully!');
    } catch (err) {
      setTasks(prev => prev.filter(t => t._id !== tempId));
      handleAuthError(err);
    }
  };

  const handleToggleComplete = async (task) => {
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, completed: !t.completed } : t));
    try {
      await updateTask(task._id, { completed: !task.completed });
    } catch (err) {
      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, completed: task.completed } : t));
      handleAuthError(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      const taskToDelete = tasks.find(t => t._id === id);
      setTasks(prev => prev.filter(t => t._id !== id));
      try {
        await deleteTask(id);
        showToast('Task deleted successfully!');
      } catch (err) {
        setTasks(prev => [...prev, taskToDelete]);
        handleAuthError(err);
      }
    }
  };

  // View Components
  const AuthOverlay = () => (
    <div className="auth-overlay">
      <div className="auth-container modern-auth">
        <button className="back-btn" onClick={() => setShowAuthView(false)}>
          Back
        </button>
        <div className="auth-header">
          <h1>{isLoginView ? 'Welcome Back' : 'Create Account'}</h1>
          <p>{isLoginView ? 'Sign in to access your tasks' : 'Sign up to get started'}</p>
        </div>
        <form onSubmit={handleAuthSubmit} className="auth-form">
          <input type="email" placeholder="Email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
          <button type="submit">{isLoginView ? 'Sign In' : 'Sign Up'}</button>
        </form>
        <div className="auth-toggle" onClick={() => setIsLoginView(!isLoginView)}>
          {isLoginView ? "Don't have an account? Register" : "Already have an account? Login"}
        </div>
      </div>
    </div>
  );

  const Dashboard = () => (
    <div className="container">
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon"></div>
          <h1>Task Manager</h1>
        </div>
        <div className="user-controls">
          <Link to="/stats" className="stats-link" style={{marginRight: '1rem', color: '#666', textDecoration: 'underline'}}>View Stats</Link>
          {user && <span className="user-email">Logged in as: {user.email}</span>}
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <form onSubmit={handleCreate} className="task-form">
        <input type="text" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <select value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <button type="submit">Add Task</button>
      </form>

      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="task-list">
          {tasks.length === 0 ? <p className="empty-state">No tasks found. Create one!</p> : null}
          {tasks.map(task => (
            <div key={task._id} className={`task-card priority-${task.priority} ${task.completed ? 'completed' : ''}`}>
              <div className="task-info">
                <h3>{task.title} <span className={`priority-badge ${task.priority}`}>{task.priority}</span></h3>
                {task.description && <p>{task.description}</p>}
              </div>
              <div className="task-actions">
                <button className="complete-btn" onClick={() => handleToggleComplete(task)}>
                  {task.completed ? 'Undo' : 'Complete'}
                </button>
                <button className="delete-btn" onClick={() => handleDelete(task._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Routing
  return (
    <BrowserRouter>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Fallback UI with a minimum delay to prevent flickering */}
      <Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
          <h2>Loading chunk... (Simulating Slow 3G)</h2>
        </div>
      }>
        <Routes>
          <Route path="/" element={
            token ? <Navigate to="/dashboard" /> : (
              showAuthView ? <AuthOverlay /> : <LandingPage onLoginClick={() => setShowAuthView(true)} />
            )
          } />
          <Route path="/dashboard" element={
            token ? <Dashboard /> : <Navigate to="/" />
          } />
          <Route path="/stats" element={
            token ? (
              <div className="container">
                <header className="app-header">
                  <div className="logo">
                    <div className="logo-icon"></div>
                    <h1>Task Analytics</h1>
                  </div>
                  <Link to="/dashboard" style={{color: '#666', textDecoration: 'none'}}>← Back to Tasks</Link>
                </header>
                <Stats tasks={tasks} />
              </div>
            ) : <Navigate to="/" />
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
