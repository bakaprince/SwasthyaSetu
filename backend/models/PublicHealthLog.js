const mongoose = require('mongoose');

const publicHealthLogSchema = new mongoose.Schema({
    disease: {
        type: String,
        required: true,
        index: true
    },
    location: {
        state: { type: String, required: true },
        city: { type: String, required: true },
        lat: { type: Number },
        lng: { type: Number }
    },
    status: {
        type: String,
        enum: ['active', 'recovered', 'deceased'],
        default: 'active'
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital'
    },
    dateReported: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Compound index for geospatial-like queries or aggregation
publicHealthLogSchema.index({ 'location.state': 1, disease: 1, dateReported: -1 });

module.exports = mongoose.model('PublicHealthLog', publicHealthLogSchema);
