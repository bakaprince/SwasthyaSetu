const HealthAlert = require('../models/HealthAlert');

/**
 * @desc    Get active health alerts
 * @route   GET /api/health/alerts
 * @access  Public
 */
const getHealthAlerts = async (req, res, next) => {
    try {
        const alerts = await HealthAlert.find({ isActive: true })
            .sort({ severity: -1, createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            count: alerts.length,
            data: alerts
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get AQI data (proxy to external API)
 * @route   GET /api/health/aqi
 * @access  Public
 */
const getAQI = async (req, res, next) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        // For now, return a placeholder response
        // In production, you would call the WAQI API from the backend
        res.json({
            success: true,
            data: {
                aqi: 0,
                level: 'Unknown',
                message: 'AQI data should be fetched from frontend using WAQI API'
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getHealthAlerts,
    getAQI
};
