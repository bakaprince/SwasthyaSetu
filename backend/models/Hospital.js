const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Hospital name is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['Government', 'Private', 'Trust'],
        required: [true, 'Hospital type is required']
    },
    beds: {
        total: {
            type: Number,
            default: 0
        },
        available: {
            type: Number,
            default: 0
        },
        icu: {
            type: Number,
            default: 0
        },
        icuAvailable: {
            type: Number,
            default: 0
        }
    },
    resources: {
        oxygen: {
            type: Boolean,
            default: false
        },
        ventilators: {
            type: Boolean,
            default: false
        },
        bloodBank: {
            type: Boolean,
            default: false
        }
    },
    contact: {
        phone: {
            type: String,
            required: [true, 'Contact phone is required']
        },
        email: {
            type: String,
            lowercase: true
        },
        emergency: {
            type: String,
            default: '108'
        }
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    location: {
        latitude: Number,
        longitude: Number
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    departments: [{
        name: String,
        doctors: [{
            name: String,
            specialty: String,
            available: Boolean
        }]
    }]
}, {
    timestamps: true
});

// Index for location-based queries
hospitalSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
hospitalSchema.index({ city: 1, type: 1 });

module.exports = mongoose.model('Hospital', hospitalSchema);
