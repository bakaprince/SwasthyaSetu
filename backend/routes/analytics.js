const express = require('express');
const router = express.Router();
const {
    getDiseaseMap,
    getCrisisAlerts,
    getHospitalPerformance,
    getOutcomeStats
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

// All routes require Government Admin privileges
router.use(protect);
router.use(authorize('government', 'admin')); // Allow hospital admins to see some analytics too potentially, but mainly Gov

router.get('/disease-map', getDiseaseMap);
router.get('/alerts', getCrisisAlerts);
router.get('/hospital-performance', getHospitalPerformance);
router.get('/outcomes', getOutcomeStats);

module.exports = router;
