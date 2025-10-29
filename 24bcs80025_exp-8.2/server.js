
// server.js
// Simple Express server with JWT authentication example

const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Secret key (change this in production)
const SECRET_KEY = 'your-secret-key-change-in-production';
const PORT = 3000;

// Hardcoded demo user (replace with DB validation in production)
const user = {
  id: 1,
  username: 'testuser',
  password: 'password123'
};

// Middleware: Verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded; // attach decoded user info
    next();
  });
};

// Route: Login (returns JWT token)
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === user.username && password === user.password) {
    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ token });
  }

  res.status(401).json({ message: 'Invalid credentials' });
});

// Route: Protected (requires token)
app.get('/protected', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'You have accessed a protected route!',
    user: {
      id: req.user.id,
      username: req.user.username,
      iat: req.user.iat,
      exp: req.user.exp
    }
  });
});

// Route: Public (no authentication needed)
app.get('/public', (req, res) => {
  res.status(200).json({ message: 'This is a public route' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
