const express = require('express');
const router = express.Router();
const {
    getAppointments,
    getHospitalAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

// Patient routes
router.get('/', protect, getAppointments);
router.post('/', protect, authorize('patient'), createAppointment);
router.delete('/:id', protect, cancelAppointment);

// Hospital admin routes
router.get('/hospital', protect, authorize('admin'), getHospitalAppointments);
router.put('/:id', protect, authorize('admin'), updateAppointment);

module.exports = router;
