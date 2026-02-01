const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/me', protect, getMe);
router.get('/verify', protect, verifyToken);

module.exports = router;
