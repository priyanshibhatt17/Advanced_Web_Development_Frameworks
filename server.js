const express = require('express');
const app = express();
const PORT = 5000;

// 1. GLOBAL MIDDLEWARES
// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// JSON Body Parser Middleware
app.use(express.json());

// Content-Type Validation Middleware for POST and PUT
const requireJsonContent = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
      return res.status(400).json({ error: 'Content-Type must be application/json' });
    }
  }
  next();
};
app.use(requireJsonContent);

// 2. IN-MEMORY DATABASE & ROUTES

let tasks = [];

// READ: Get all tasks
app.get('/tasks', (req, res, next) => {
  try {
    res.status(200).json(tasks);
  } catch (err) {
    next(err); // Pass to global error handler
  }
});

// CREATE: Add a new task
app.post('/tasks', (req, res, next) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const newTask = {
      id: Date.now().toString(),
      title,
      description: description || '',
      completed: false,
      createdAt: new Date()
    };
    
    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});

// Route-Specific Middleware: Validate Task ID format
const validateTaskId = (req, res, next) => {
  const { id } = req.params;
  // Since we use Date.now().toString(), the ID should be numeric.
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid Task ID format. Must be numeric.' });
  }
  next();
};

// UPDATE: Update a task by ID
app.put('/tasks/:id', validateTaskId, (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update fields if provided
    if (title !== undefined) tasks[taskIndex].title = title;
    if (description !== undefined) tasks[taskIndex].description = description;
    if (completed !== undefined) tasks[taskIndex].completed = completed;

    res.status(200).json(tasks[taskIndex]);
  } catch (err) {
    next(err);
  }
});

// DELETE: Remove a task by ID
app.delete('/tasks/:id', validateTaskId, (req, res, next) => {
  try {
    const { id } = req.params;
    const initialLength = tasks.length;
    
    tasks = tasks.filter(t => t.id !== id);

    if (tasks.length === initialLength) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// (Deliberate Error Route for Testing the Global Error Handler)
app.get('/crash', (req, res, next) => {
  next(new Error('This is a simulated server crash!'));
});

// 3. FALLBACK HANDLERS & ERROR PIPELINE

// Custom 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handling Middleware (Must be last)
app.use((err, req, res, next) => {
  console.error('[Global Error Logger]:', err.stack);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Task Manager API running on http://localhost:${PORT}`);
});
