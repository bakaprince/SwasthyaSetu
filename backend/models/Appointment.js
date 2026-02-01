const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: [true, 'Hospital ID is required']
    },
    doctor: {
        type: String,
        required: [true, 'Doctor name is required']
    },
    specialty: {
        type: String,
        required: [true, 'Specialty is required']
    },
    date: {
        type: Date,
        required: [true, 'Appointment date is required']
    },
    time: {
        type: String,
        required: [true, 'Appointment time is required']
    },
    type: {
        type: String,
        enum: ['In-person', 'Telemedicine'],
        required: [true, 'Appointment type is required']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'],
        default: 'pending'
    },
    reason: {
        type: String,
        required: [true, 'Reason for appointment is required']
    },
    notes: {
        type: String // Hospital admin notes
    },
    confirmedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Hospital admin who confirmed
    },
    confirmedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
appointmentSchema.index({ userId: 1, date: -1 });
appointmentSchema.index({ hospitalId: 1, status: 1, date: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
