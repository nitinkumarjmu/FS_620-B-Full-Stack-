
// index.js
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

const SECRET = 'your-secret-key';

// Dummy users
const users = [
  { id: 1, username: 'adminUser', password: 'admin123', role: 'Admin' },
  { id: 2, username: 'modUser', password: 'mod123', role: 'Moderator' },
  { id: 3, username: 'normalUser', password: 'user123', role: 'User' }
];

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Middleware to verify JWT and role
const authorize = (roles = []) => (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    if (roles.length && !roles.includes(user.role)) return res.status(403).json({ message: 'Access denied: insufficient role' });
    req.user = user;
    next();
  });
};

// Protected routes
app.get('/admin-dashboard', authorize(['Admin']), (req, res) => {
  res.json({ message: 'Welcome to the Admin dashboard', user: req.user });
});

app.get('/moderator-panel', authorize(['Moderator']), (req, res) => {
  res.json({ message: 'Welcome to the Moderator panel', user: req.user });
});

app.get('/user-profile', authorize(['Admin', 'Moderator', 'User']), (req, res) => {
  res.json({ message: `Welcome to your profile, ${req.user.username}`, user: req.user });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
