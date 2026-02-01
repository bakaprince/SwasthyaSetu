const Appointment = require('../models/Appointment');
const Hospital = require('../models/Hospital');

/**
 * @desc    Get user appointments
 * @route   GET /api/appointments
 * @access  Private (Patient)
 */
const getAppointments = async (req, res, next) => {
    try {
        const appointments = await Appointment.find({ userId: req.user.id })
            .populate('hospitalId', 'name city address contact')
            .sort({ date: -1 });

        res.json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get hospital appointments (for hospital admins)
 * @route   GET /api/appointments/hospital
 * @access  Private (Admin)
 */
const getHospitalAppointments = async (req, res, next) => {
    try {
        const { status } = req.query;

        // Build query
        const query = { hospitalId: req.user.hospitalId };
        if (status) {
            query.status = status;
        }

        const appointments = await Appointment.find(query)
            .populate('userId', 'name abhaId mobile age gender')
            .sort({ date: -1, createdAt: -1 });

        res.json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create appointment request
 * @route   POST /api/appointments
 * @access  Private (Patient)
 */
const createAppointment = async (req, res, next) => {
    try {
        const { hospitalId, doctor, specialty, date, time, type, reason } = req.body;

        // Verify hospital exists
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        // Create appointment
        const appointment = await Appointment.create({
            userId: req.user.id,
            hospitalId,
            doctor,
            specialty,
            date,
            time,
            type,
            reason,
            status: 'pending' // Default status for patient requests
        });

        // Populate hospital details
        await appointment.populate('hospitalId', 'name city address contact');

        res.status(201).json({
            success: true,
            message: 'Appointment request created successfully',
            data: appointment
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update appointment (for hospital admins)
 * @route   PUT /api/appointments/:id
 * @access  Private (Admin)
 */
const updateAppointment = async (req, res, next) => {
    try {
        const { status, notes } = req.body;

        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check if admin belongs to the same hospital
        if (req.user.role === 'admin' && appointment.hospitalId.toString() !== req.user.hospitalId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this appointment'
            });
        }

        // Update appointment
        appointment.status = status || appointment.status;
        appointment.notes = notes || appointment.notes;

        if (status === 'confirmed') {
            appointment.confirmedBy = req.user.id;
            appointment.confirmedAt = Date.now();
        }

        await appointment.save();

        // Populate details
        await appointment.populate('userId', 'name abhaId mobile');
        await appointment.populate('hospitalId', 'name city');

        res.json({
            success: true,
            message: 'Appointment updated successfully',
            data: appointment
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cancel appointment
 * @route   DELETE /api/appointments/:id
 * @access  Private
 */
const cancelAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check if user owns the appointment or is admin
        if (appointment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this appointment'
            });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        res.json({
            success: true,
            message: 'Appointment cancelled successfully',
            data: appointment
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAppointments,
    getHospitalAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment
};
