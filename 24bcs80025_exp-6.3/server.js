const express = require('express');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// --- MongoDB Connection ---
const MONGO_URI = 'mongodb://127.0.0.1:27017/bank'; // Using 127.0.0.1 instead of localhost
mongoose.connect(MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB!'))
    .catch(err => console.error('Connection error', err));


// --- API Routes ---
app.use('/', apiRoutes);


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
