const express = require('express');
const { createPost, getPosts, updatePost, deletePost } = require('../controllers/posts');
const { authMiddleware } = require('../controllers/middleware');
const router = express.Router();
router.get('/', getPosts);
router.post('/', authMiddleware, createPost);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);
module.exports = router;