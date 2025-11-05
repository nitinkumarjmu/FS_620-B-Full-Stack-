const express = require('express');
const { signup, login, me } = require('../controllers/auth');
const router = express.Router();
const { authMiddleware } = require('../controllers/middleware');
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authMiddleware, me);
module.exports = router;