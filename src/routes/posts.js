const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticate } = require('../middleware/auth');

// GET /api/v1/posts/search - Search posts by query
router.get('/search', postController.searchPosts);

// POST /api/v1/posts - Create a new post (auth required)
router.post('/', authenticate, postController.create);

// GET /api/v1/posts - Get all posts (paginated)
router.get('/', postController.getAll);

// GET /api/v1/posts/:id - Get a single post
router.get('/:id', postController.getById);

// PUT /api/v1/posts/:id - Update a post (auth required, owner only)
router.put('/:id', authenticate, postController.update);

// DELETE /api/v1/posts/:id - Delete a post (auth required, owner only)
router.delete('/:id', authenticate, postController.delete);

// GET /api/v1/posts/user/:userId - Get posts by user ID (paginated)
router.get('/user/:userId', postController.getByUserId);

module.exports = router;
