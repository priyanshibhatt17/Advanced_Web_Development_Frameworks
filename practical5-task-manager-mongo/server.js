const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Task = require('./models/Task');

// Load environment variables if .env exists
try {
  require('dotenv').config();
} catch (e) {
  // dotenv might not be installed, ignore
}

const app = express();
const PORT = process.env.PORT || 5000;

// 1. MIDDLEWARE
app.use(cors());
app.use(express.json());

// JSON Parsing Error Handler
const requireJsonContent = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON format in request body' });
  }
  next();
};
app.use(requireJsonContent);

// 2. MONGODB CONNECTION
mongoose.connect('mongodb://127.0.0.1:27017/taskmanager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Successfully connected to MongoDB!'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// 3. DATABASE ROUTES

// READ: Get all tasks
app.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});

// READ: Get one task by ID (with 404 handling)
app.get('/tasks/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
});

// CREATE: Add a new task
app.post('/tasks', async (req, res, next) => {
  try {
    const newTask = await Task.create(req.body);
    res.status(201).json(newTask);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    next(err);
  }
});

// UPDATE: Update a task by ID
app.put('/tasks/:id', async (req, res, next) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(updatedTask);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    next(err);
  }
});

// DELETE: Remove a task by ID
app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// 4. FALLBACK HANDLERS & ERROR PIPELINE

// Custom 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Global Error Logger]:', err.stack);
  
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ error: 'Invalid Task ID format' });
  }

  res.status(500).json({ error: 'Something went wrong on the server' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Task Manager DB API running on http://localhost:${PORT}`);
});
