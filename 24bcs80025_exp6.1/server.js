const express = require('express');
require('dotenv').config();
const logger = require('./middleware/logger');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Apply logger middleware globally
app.use(logger);

// Public Route
app.get('/public', (req, res) => {
  res.send("This is a public route. No authentication required.");
});

// Protected Route
app.get('/protected', auth, (req, res) => {
  res.send("You have accessed a protected route with a valid Bearer token!");
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
