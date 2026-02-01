const mongoose = require('mongoose');

const healthAlertSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Alert title is required'],
        trim: true
    },
    severity: {
        type: String,
        enum: ['high', 'moderate', 'low'],
        required: [true, 'Severity is required']
    },
    type: {
        type: String,
        enum: ['disease', 'weather', 'pollution'],
        required: [true, 'Alert type is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    symptoms: [{
        type: String
    }],
    prevention: [{
        type: String
    }],
    affectedAreas: [{
        type: String
    }],
    riskLevel: {
        type: Number,
        min: 0,
        max: 100
    },
    isActive: {
        type: Boolean,
        default: true
    },
    source: {
        type: String
    }
}, {
    timestamps: true
});

// Index for active alerts
healthAlertSchema.index({ isActive: 1, severity: -1, createdAt: -1 });

module.exports = mongoose.model('HealthAlert', healthAlertSchema);
