const express = require('express');
const { createComment, getComments, deleteComment } = require('../controllers/comments');
const { authMiddleware } = require('../controllers/middleware');
const router = express.Router();
router.get('/', getComments);
router.post('/', authMiddleware, createComment);
router.delete('/:id', authMiddleware, deleteComment);
module.exports = router;