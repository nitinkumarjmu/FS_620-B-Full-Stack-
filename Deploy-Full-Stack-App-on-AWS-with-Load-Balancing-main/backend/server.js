const express = require('express');
const cors = require('cors');
const os = require('os');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (required for ALB)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    server: os.hostname(),
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AWS Backend API',
    version: '1.0.0',
    server: os.hostname()
  });
});

// Sample data endpoint
app.get('/api/data', (req, res) => {
  res.json({
    message: 'Data retrieved successfully',
    server: os.hostname(),
    data: [
      { id: 1, name: 'Item 1', description: 'First item' },
      { id: 2, name: 'Item 2', description: 'Second item' },
      { id: 3, name: 'Item 3', description: 'Third item' },
      { id: 4, name: 'Item 4', description: 'Fourth item' },
      { id: 5, name: 'Item 5', description: 'Fifth item' }
    ],
    timestamp: new Date().toISOString()
  });
});

// Create new item
app.post('/api/data', (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ 
      error: 'Name is required',
      server: os.hostname()
    });
  }

  res.status(201).json({
    message: 'Data created successfully',
    server: os.hostname(),
    data: {
      id: Date.now(),
      name,
      description: description || '',
      createdAt: new Date().toISOString()
    }
  });
});

// Get single item
app.get('/api/data/:id', (req, res) => {
  const { id } = req.params;

  res.json({
    message: 'Item retrieved',
    server: os.hostname(),
    data: {
      id: parseInt(id),
      name: `Item ${id}`,
      description: `Description for item ${id}`
    }
  });
});

// Update item
app.put('/api/data/:id', (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  res.json({
    message: 'Item updated successfully',
    server: os.hostname(),
    data: {
      id: parseInt(id),
      name: name || `Item ${id}`,
      description: description || '',
      updatedAt: new Date().toISOString()
    }
  });
});

// Delete item
app.delete('/api/data/:id', (req, res) => {
  const { id } = req.params;

  res.json({
    message: 'Item deleted successfully',
    server: os.hostname(),
    deletedId: parseInt(id)
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    server: os.hostname(),
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    server: os.hostname(),
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Server Started Successfully              ║
╠════════════════════════════════════════════╣
║   Port:     ${PORT}                        ║
║   Hostname: ${os.hostname()}               ║
║   Time:     ${new Date().toISOString()}    ║
╚════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
