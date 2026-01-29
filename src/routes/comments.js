const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');

// POST /api/v1/comments/posts/:postId - Create a comment (auth required)
router.post('/posts/:postId', authenticate, commentController.create);

// GET /api/v1/comments/posts/:postId - Get comments for a post
router.get('/posts/:postId', commentController.getByPostId);

// PUT /api/v1/comments/:id - Update a comment (auth required, owner only)
router.put('/:id', authenticate, commentController.update);

// DELETE /api/v1/comments/:id - Delete a comment (auth required, owner only)
router.delete('/:id', authenticate, commentController.delete);

module.exports = router;
