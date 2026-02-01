const express = require('express');
const router = express.Router();
const {
    getHealthAlerts,
    getAQI
} = require('../controllers/healthController');

// Public routes
router.get('/alerts', getHealthAlerts);
router.get('/aqi', getAQI);

module.exports = router;
