const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.get('/verify', protect, verifyToken);

module.exports = router;
