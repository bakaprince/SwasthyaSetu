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
const mongoose = require('mongoose');

// ... (existing imports/code)

/**
 * @desc    Create appointment request
 * @route   POST /api/appointments
 * @access  Private (Patient)
 */
const createAppointment = async (req, res, next) => {
    try {
        const { hospitalId, hospital, hospitalAddress, doctor, specialty, date, time, type, reason } = req.body;

        let finalHospitalName = hospital;
        let finalHospitalAddress = hospitalAddress;

        // Verify hospital exists ONLY if it looks like a valid MongoDB ObjectId
        // AND it's not our generic fallback ID for external hospitals
        // Check if hospital exists (by ID or Name) or Create it
        const fallbackId = '507f1f77bcf86cd799439011';
        let dbHospital = null;

        // 1. Try finding by ID
        if (mongoose.Types.ObjectId.isValid(hospitalId) && hospitalId !== fallbackId) {
            dbHospital = await Hospital.findById(hospitalId);
        }

        // 2. If not found by ID, try finding by Name
        if (!dbHospital && hospital) {
            dbHospital = await Hospital.findOne({ name: hospital });
        }

        // 3. If still not found, Create new Hospital (Auto-onboarding)
        if (!dbHospital && hospital) {
            // Extract city from address or default
            let city = 'Your City';
            if (hospitalAddress) {
                const parts = hospitalAddress.split(',');
                if (parts.length > 1) {
                    city = parts[parts.length - 1].trim(); // Take last part as city
                }
            }

            try {
                dbHospital = await Hospital.create({
                    name: hospital,
                    address: hospitalAddress || 'Address not provided',
                    city: city,
                    type: 'Private', // Default type
                    contact: {
                        phone: '0000000000', // Placeholder
                        emergency: '108'
                    },
                    // We don't have location coords easily from just address string, but that's ok
                });
                console.log(`Auto-onboarded new hospital: ${hospital}`);
            } catch (createError) {
                console.error("Error auto-creating hospital:", createError);
                // Fallback to not having a dbHospital, just text
            }
        }

        // Update details if we found/created a hospital
        if (dbHospital) {
            finalHospitalName = dbHospital.name;
            finalHospitalAddress = dbHospital.address;
            // UPDATE the request hospitalId to the REAL DB ID
            // This ensures future lookups work
            // We use 'var' or modify the 'hospitalId' variable if it was let, but it's const destructuring.
            // So we override it in the create call below.
        }

        // Ensure we have a name (either from DB or request)
        if (!finalHospitalName) {
            finalHospitalName = "Unknown Hospital";
        }

        // Create appointment
        const appointment = await Appointment.create({
            userId: req.user.id,
            hospitalId: dbHospital ? dbHospital._id : hospitalId,
            hospital: finalHospitalName,
            hospitalAddress: finalHospitalAddress,
            doctor,
            specialty,
            date,
            time,
            type,
            reason,
            status: 'pending' // Default status for patient requests
        });

        // We don't populate 'hospitalId' here anymore because it might be a string
        // Instead we construct the response with the data we have
        const populatedAppointment = appointment.toObject();
        populatedAppointment.hospitalId = {
            _id: appointment.hospitalId,
            name: finalHospitalName,
            city: finalHospitalAddress,
            address: finalHospitalAddress
        };

        res.status(201).json({
            success: true,
            message: 'Appointment request created successfully',
            data: populatedAppointment
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
