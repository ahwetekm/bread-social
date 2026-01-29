const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// GET /api/v1/users/search - Search users by query
router.get('/search', userController.searchUsers);

// GET /api/v1/users/:username - Get user profile by username
router.get('/:username', userController.getProfile);

// GET /api/v1/users/id/:userId - Get user profile by ID
router.get('/id/:userId', userController.getProfileById);

// PUT /api/v1/users/profile - Update own profile (auth required)
router.put('/profile', authenticate, userController.updateProfile);

// GET /api/v1/users/:userId/posts - Get user's posts (paginated)
router.get('/:userId/posts', userController.getUserPosts);

module.exports = router;
