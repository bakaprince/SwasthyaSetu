const { body, validationResult } = require('express-validator');

/**
 * Validation middleware for API requests
 */

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Registration validation
const validateRegister = [
    body('abhaId')
        .trim()
        .matches(/^\d{2}-\d{4}-\d{4}-\d{4}$/)
        .withMessage('Invalid ABHA ID format. Use XX-XXXX-XXXX-XXXX'),

    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),

    body('mobile')
        .trim()
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Invalid mobile number. Must be 10 digits starting with 6-9'),

    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Invalid email address'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),

    body('dateOfBirth')
        .isISO8601()
        .withMessage('Invalid date of birth'),

    body('gender')
        .isIn(['Male', 'Female', 'Other'])
        .withMessage('Gender must be Male, Female, or Other'),

    handleValidationErrors
];

// Login validation
const validateLogin = [
    body('abhaId')
        .trim()
        .notEmpty()
        .withMessage('ABHA ID is required'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    handleValidationErrors
];

// Appointment validation
const validateAppointment = [
    body('hospital')
        .trim()
        .notEmpty()
        .withMessage('Hospital name is required'),

    body('doctor')
        .trim()
        .notEmpty()
        .withMessage('Doctor name is required'),

    body('specialty')
        .trim()
        .notEmpty()
        .withMessage('Specialty is required'),

    body('date')
        .isISO8601()
        .withMessage('Invalid date format')
        .custom((value) => {
            const appointmentDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (appointmentDate < today) {
                throw new Error('Appointment date cannot be in the past');
            }
            return true;
        }),

    body('time')
        .trim()
        .notEmpty()
        .withMessage('Time is required'),

    body('type')
        .isIn(['In-person', 'Telemedicine'])
        .withMessage('Type must be In-person or Telemedicine'),

    handleValidationErrors
];

module.exports = {
    validateRegister,
    validateLogin,
    validateAppointment
};
