const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');

/**
 * @desc    Get user profile
 * @route   GET /api/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email,
            bloodGroup: req.body.bloodGroup,
            address: req.body.address,
            location: req.body.location,
            emergencyContact: req.body.emergencyContact
        };

        // Remove undefined fields
        Object.keys(fieldsToUpdate).forEach(key =>
            fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
        );

        const user = await User.findByIdAndUpdate(
            req.user.id,
            fieldsToUpdate,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get medical records
 * @route   GET /api/profile/records
 * @access  Private
 */
const getMedicalRecords = async (req, res, next) => {
    try {
        const records = await MedicalRecord.find({ userId: req.user.id })
            .sort({ date: -1 });

        res.json({
            success: true,
            count: records.length,
            data: records
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getMedicalRecords
};
