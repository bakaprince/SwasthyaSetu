const express = require('express');
const router = express.Router();
const {
    getHospitals,
    getHospital,
    getNearbyHospitals
} = require('../controllers/hospitalController');

// Public routes
router.get('/', getHospitals);
router.get('/nearby/:lat/:lng', getNearbyHospitals);
router.get('/:id', getHospital);

module.exports = router;
