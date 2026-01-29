const express = require('express');
const router = express.Router();
const repostController = require('../controllers/repostController');
const { authenticate } = require('../middleware/auth');

// POST /api/v1/reposts/posts/:postId - Repost a post (auth required)
router.post('/posts/:postId', authenticate, repostController.create);

// DELETE /api/v1/reposts/posts/:postId - Unrepost a post (auth required)
router.delete('/posts/:postId', authenticate, repostController.delete);

// GET /api/v1/reposts/posts/:postId - Get reposts for a post
router.get('/posts/:postId', repostController.getByPostId);

// GET /api/v1/reposts/posts/:postId/check - Check if user reposted a post (auth required)
router.get('/posts/:postId/check', authenticate, repostController.checkUserRepost);

module.exports = router;
