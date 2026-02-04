const PublicHealthLog = require('../models/PublicHealthLog');
const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment');

/**
 * @desc    Get aggregated disease data for Heatmap
 * @route   GET /api/analytics/disease-map
 * @access  Private (Gov Admin)
 */
const getDiseaseMap = async (req, res, next) => {
    try {
        // Aggregate active cases by city/location
        const data = await PublicHealthLog.aggregate([
            {
                $match: { status: 'active' }
            },
            {
                $group: {
                    _id: { city: "$location.city", state: "$location.state", lat: "$location.lat", lng: "$location.lng", disease: "$disease" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    city: "$_id.city",
                    state: "$_id.state",
                    lat: "$_id.lat",
                    lng: "$_id.lng",
                    disease: "$_id.disease",
                    count: 1
                }
            }
        ]);

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Crisis Alerts (Outbreak Detection)
 * @route   GET /api/analytics/alerts
 * @access  Private (Gov Admin)
 */
const getCrisisAlerts = async (req, res, next) => {
    try {
        const threshold = 50; // Threshold for outbreak alert

        // Find cities with high case count in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const outbreaks = await PublicHealthLog.aggregate([
            {
                $match: {
                    dateReported: { $gte: sevenDaysAgo },
                    status: 'active'
                }
            },
            {
                $group: {
                    _id: { city: "$location.city", disease: "$disease" },
                    count: { $sum: 1 }
                }
            },
            {
                $match: { count: { $gt: threshold } }
            }
        ]);

        const alerts = outbreaks.map(o => ({
            type: 'outbreak',
            severity: 'high',
            message: `Outbreak Alert: ${o._id.disease} detected in ${o._id.city} (${o.count} cases in last 7 days)`,
            location: o._id.city,
            disease: o._id.disease,
            count: o.count
        }));

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
 * @desc    Get Hospital Performance & Stats
 * @route   GET /api/analytics/hospital-performance
 * @access  Private (Gov Admin)
 */
const getHospitalPerformance = async (req, res, next) => {
    try {
        // Simulated Performance Data (since we don't have a full Feedback model populated yet)
        // In a real app, this would aggregate from a Feedback collection.

        // Let's get actual hospital count
        const totalHospitals = await Hospital.countDocuments();

        // Mock some aggregated data for charts
        const performanceData = {
            ratings: {
                '5_star': 45,
                '4_star': 30,
                '3_star': 15,
                '2_star': 8,
                '1_star': 2
            },
            topPerforming: [
                { name: 'AIIMS Delhi', rating: 4.9, reviews: 1240 },
                { name: 'Apollo Chennai', rating: 4.8, reviews: 980 },
                { name: 'Fortis Mumbai', rating: 4.7, reviews: 850 }
            ],
            needingAttention: [
                { name: 'City General Hospital', rating: 2.1, issues: 'Hygiene, Wait Times' },
                { name: 'District Hospital Agra', rating: 2.3, issues: 'Staff Shortage' }
            ]
        };

        res.json({
            success: true,
            totalHospitals,
            data: performanceData
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Casualties vs Recoveries Stats
 * @route   GET /api/analytics/outcomes
 */
const getOutcomeStats = async (req, res, next) => {
    try {
        const stats = await PublicHealthLog.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Transform to readable object
        const outcomes = {
            active: 0,
            recovered: 0,
            deceased: 0
        };

        stats.forEach(s => {
            if (outcomes[s._id] !== undefined) {
                outcomes[s._id] = s.count;
            }
        });

        res.json({
            success: true,
            data: outcomes
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDiseaseMap,
    getCrisisAlerts,
    getHospitalPerformance,
    getOutcomeStats
};
