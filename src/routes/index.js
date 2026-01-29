const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const postRoutes = require('./posts');
const userRoutes = require('./users');
const likeRoutes = require('./likes');
const commentRoutes = require('./comments');
const repostRoutes = require('./reposts');
const followRoutes = require('./follows');
const feedRoutes = require('./feed');

// Auth routes
router.use('/auth', authRoutes);

// Post routes
router.use('/posts', postRoutes);

// User routes
router.use('/users', userRoutes);

// Like routes
router.use('/likes', likeRoutes);

// Comment routes
router.use('/comments', commentRoutes);

// Repost routes
router.use('/reposts', repostRoutes);

// Follow routes
router.use('/follows', followRoutes);

// Feed routes
router.use('/feed', feedRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
