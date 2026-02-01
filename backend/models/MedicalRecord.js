const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    date: {
        type: Date,
        required: [true, 'Record date is required']
    },
    hospital: {
        type: String,
        required: [true, 'Hospital name is required']
    },
    doctor: {
        type: String,
        required: [true, 'Doctor name is required']
    },
    diagnosis: {
        type: String,
        required: [true, 'Diagnosis is required']
    },
    prescriptions: [{
        type: String
    }],
    documents: [{
        type: String // URLs to documents
    }],
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Index for user queries
medicalRecordSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
