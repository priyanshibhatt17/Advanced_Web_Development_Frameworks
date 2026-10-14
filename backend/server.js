require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const NodeCache = require('node-cache');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Task = require('./models/Task');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_lab_key';

// 0. CORS CONFIGURATION
app.use(cors());

// 1. IN-MEMORY CACHE INITIALIZATION (PRACTICAL 9)
// Standard TTL: 60 seconds, check period: 120 seconds
const taskCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// Cache hit/miss counters (Supplementary Problem 2)
let cacheHits = 0;
let cacheMisses = 0;

// 2. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanager')
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// 3. GLOBAL MIDDLEWARES
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

const requireJsonContent = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
      return res.status(400).json({ error: 'Content-Type must be application/json' });
    }
  }
  next();
};
app.use(requireJsonContent);

// 4. AUTHENTICATION MIDDLEWARE (PRACTICAL 7)
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// 5. INPUT VALIDATION MIDDLEWARE (PRACTICAL 7)
const validateTaskInput = (req, res, next) => {
  if (req.method === 'POST') {
    if (!req.body.title || req.body.title.trim() === '') {
      return res.status(400).json({ error: 'Validation Error: Title is missing or empty' });
    }
  }
  next();
};

// 6. AUTHENTICATION ROUTES
// Register
app.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    
    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (err) {
    next(err);
  }
});

// Login
app.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, message: 'Logged in successfully' });
  } catch (err) {
    next(err);
  }
});

// Me (Current user)
app.get('/me', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// 7. CACHE DEBUG / METRICS ENDPOINT (PRACTICAL 9: SUPPLEMENTARY PROBLEM 2)
app.get('/cache-stats', (req, res) => {
  const total = cacheHits + cacheMisses;
  const hitRatio = total > 0 ? ((cacheHits / total) * 100).toFixed(1) + '%' : '0%';
  
  res.status(200).json({
    metrics: {
      cacheHits,
      cacheMisses,
      totalRequests: total,
      hitRatio
    },
    activeKeys: taskCache.keys(),
    internalStats: taskCache.getStats(),
    defaultTTL: '60 seconds'
  });
});

// Cache Flush endpoint for testing
app.post('/cache/flush', (req, res) => {
  taskCache.flushAll();
  cacheHits = 0;
  cacheMisses = 0;
  res.status(200).json({ message: 'Cache flushed and statistics reset successfully.' });
});

// 8. DATABASE ROUTES (WITH IN-MEMORY CACHING)
app.use('/tasks', verifyToken, validateTaskInput);

// READ: Get all tasks (Cached with 60s TTL)
app.get('/tasks', async (req, res, next) => {
  const startTime = process.hrtime();
  const cacheKey = 'all_tasks';
  const bypassCache = req.query.noCache === 'true';

  // 1. Check Cache
  if (!bypassCache && taskCache.has(cacheKey)) {
    cacheHits++;
    const cachedData = taskCache.get(cacheKey);
    const diff = process.hrtime(startTime);
    const timeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);
    
    console.log(`[Cache HIT] key: "${cacheKey}" - Time: ${timeMs}ms`);
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('X-Response-Time-Ms', timeMs);
    return res.status(200).json(cachedData);
  }

  // 2. Cache MISS: Query Database
  try {
    cacheMisses++;
    const tasks = await Task.find();
    
    // Store in cache (allow custom TTL via ?ttl= query param for Supplementary Problem 3)
    const customTTL = req.query.ttl ? parseInt(req.query.ttl) : 60;
    if (!bypassCache) {
      taskCache.set(cacheKey, tasks, customTTL);
    }
    
    const diff = process.hrtime(startTime);
    const timeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);
    
    console.log(`[Cache MISS] key: "${cacheKey}" - Fetched from MongoDB - Time: ${timeMs}ms (TTL: ${customTTL}s)`);
    res.setHeader('X-Cache', bypassCache ? 'BYPASS' : 'MISS');
    res.setHeader('X-Response-Time-Ms', timeMs);
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});

// READ: Get single task by ID (Cached separately - Supplementary Problem 1)
app.get('/tasks/:id', async (req, res, next) => {
  const startTime = process.hrtime();
  const cacheKey = `task_${req.params.id}`;
  const bypassCache = req.query.noCache === 'true';

  // 1. Check Single-Task Cache
  if (!bypassCache && taskCache.has(cacheKey)) {
    cacheHits++;
    const cachedTask = taskCache.get(cacheKey);
    const diff = process.hrtime(startTime);
    const timeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);
    
    console.log(`[Cache HIT] key: "${cacheKey}" - Time: ${timeMs}ms`);
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('X-Response-Time-Ms', timeMs);
    return res.status(200).json(cachedTask);
  }

  // 2. Cache MISS: Query MongoDB
  try {
    cacheMisses++;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const customTTL = req.query.ttl ? parseInt(req.query.ttl) : 60;
    if (!bypassCache) {
      taskCache.set(cacheKey, task, customTTL);
    }

    const diff = process.hrtime(startTime);
    const timeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

    console.log(`[Cache MISS] key: "${cacheKey}" - Fetched from MongoDB - Time: ${timeMs}ms`);
    res.setHeader('X-Cache', bypassCache ? 'BYPASS' : 'MISS');
    res.setHeader('X-Response-Time-Ms', timeMs);
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
});

// CREATE: Add new task & INVALIDATE cache
app.post('/tasks', async (req, res, next) => {
  try {
    const newTask = await Task.create(req.body);

    // Invalidate the all_tasks cache key so new task is immediately visible
    taskCache.del('all_tasks');
    console.log('[Cache Invalidation]: Invalidate key "all_tasks" after POST /tasks');

    res.status(201).json(newTask);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    next(err);
  }
});

// UPDATE: Update a task by ID & INVALIDATE cache
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

    // Invalidate both 'all_tasks' and the specific 'task_:id' key
    taskCache.del(['all_tasks', `task_${req.params.id}`]);
    console.log(`[Cache Invalidation]: Invalidate keys "all_tasks" and "task_${req.params.id}" after PUT /tasks/${req.params.id}`);

    res.status(200).json(updatedTask);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    next(err);
  }
});

// DELETE: Remove a task by ID & INVALIDATE cache
app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Invalidate both 'all_tasks' and the specific 'task_:id' key
    taskCache.del(['all_tasks', `task_${req.params.id}`]);
    console.log(`[Cache Invalidation]: Invalidate keys "all_tasks" and "task_${req.params.id}" after DELETE /tasks/${req.params.id}`);

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// 9. FALLBACK HANDLERS & ERROR PIPELINE
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('[Global Error Logger]:', err.stack);
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ error: 'Invalid Task ID format' });
  }
  res.status(500).json({ error: 'Something went wrong on the server' });
});

// 10. START SERVER
app.listen(PORT, () => {
  console.log(`Task Manager Caching Server running on http://localhost:${PORT}`);
  console.log(`Cache Stats available at http://localhost:${PORT}/cache-stats`);
});
