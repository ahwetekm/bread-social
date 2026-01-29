const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const { authenticate } = require('../middleware/auth');

// POST /api/v1/likes/posts/:postId - Like a post (auth required)
router.post('/posts/:postId', authenticate, likeController.create);

// DELETE /api/v1/likes/posts/:postId - Unlike a post (auth required)
router.delete('/posts/:postId', authenticate, likeController.delete);

// GET /api/v1/likes/posts/:postId - Get likes for a post
router.get('/posts/:postId', likeController.getByPostId);

// GET /api/v1/likes/posts/:postId/check - Check if user liked a post (auth required)
router.get('/posts/:postId/check', authenticate, likeController.checkUserLike);

module.exports = router;
