const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    getMedicalRecords
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.get('/records', protect, getMedicalRecords);

module.exports = router;
