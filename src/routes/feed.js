const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const { authenticate } = require('../middleware/auth');

// GET /api/v1/feed - Get user's feed (auth required)
router.get('/', authenticate, feedController.getFeed);

module.exports = router;
