const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

// POST /api/v1/auth/register
router.post('/register', authLimiter, validateRegister, authController.register);

// POST /api/v1/auth/login
router.post('/login', authLimiter, validateLogin, authController.login);

// GET /api/v1/auth/me
router.get('/me', authenticate, authController.me);

// POST /api/v1/auth/logout
router.post('/logout', authController.logout);

module.exports = router;
