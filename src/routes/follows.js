const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const { authenticate } = require('../middleware/auth');

// POST /api/v1/follows/:userId - Follow a user (auth required)
router.post('/:userId', authenticate, followController.follow);

// DELETE /api/v1/follows/:userId - Unfollow a user (auth required)
router.delete('/:userId', authenticate, followController.unfollow);

// GET /api/v1/follows/:userId/followers - Get user's followers
router.get('/:userId/followers', followController.getFollowers);

// GET /api/v1/follows/:userId/following - Get user's following
router.get('/:userId/following', followController.getFollowing);

// GET /api/v1/follows/:userId/check - Check if following (auth required)
router.get('/:userId/check', authenticate, followController.checkFollow);

module.exports = router;
