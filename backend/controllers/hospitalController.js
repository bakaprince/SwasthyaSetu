const Hospital = require('../models/Hospital');

/**
 * @desc    Get all hospitals
 * @route   GET /api/hospitals
 * @access  Public
 */
const getHospitals = async (req, res, next) => {
    try {
        const { city, type, page = 1, limit = 20 } = req.query;

        // Build query
        const query = {};
        if (city) query.city = new RegExp(city, 'i');
        if (type) query.type = type;

        // Execute query with pagination
        const hospitals = await Hospital.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ rating: -1, name: 1 });

        const count = await Hospital.countDocuments(query);

        res.json({
            success: true,
            count: hospitals.length,
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
            data: hospitals
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single hospital
 * @route   GET /api/hospitals/:id
 * @access  Public
 */
const getHospital = async (req, res, next) => {
    try {
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        res.json({
            success: true,
            data: hospital
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get nearby hospitals
 * @route   GET /api/hospitals/nearby/:lat/:lng
 * @access  Public
 */
const getNearbyHospitals = async (req, res, next) => {
    try {
        const { lat, lng } = req.params;
        const { maxDistance = 50000 } = req.query; // Default 50km

        // Simple distance calculation (for demo - in production use MongoDB geospatial queries)
        const hospitals = await Hospital.find({
            'location.latitude': { $exists: true },
            'location.longitude': { $exists: true }
        });

        // Calculate distances and filter
        const hospitalsWithDistance = hospitals.map(hospital => {
            const distance = calculateDistance(
                parseFloat(lat),
                parseFloat(lng),
                hospital.location.latitude,
                hospital.location.longitude
            );

            return {
                ...hospital.toObject(),
                distance: Math.round(distance)
            };
        }).filter(h => h.distance <= maxDistance)
            .sort((a, b) => a.distance - b.distance);

        res.json({
            success: true,
            count: hospitalsWithDistance.length,
            data: hospitalsWithDistance
        });
    } catch (error) {
        next(error);
    }
};

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

module.exports = {
    getHospitals,
    getHospital,
    getNearbyHospitals
};
