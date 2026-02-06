/**
 * @fileoverview Input Validation Utilities
 * Centralized validation logic for all form inputs and data validation
 * @module utils/validators
 * @author SwasthyaSetu Team
 * @version 1.0.0
 */

const Validators = {
    /**
     * Validate ABHA ID format (14-digit format: XX-XXXX-XXXX-XXXX)
     * ABHA (Ayushman Bharat Health Account) is India's digital health ID
     * 
     * @param {string} abhaId - ABHA ID to validate
     * @returns {boolean} True if valid, false otherwise
     * @example
     * Validators.validateABHA('12-3456-7890-1234'); // true
     * Validators.validateABHA('123456'); // false
     */
    validateABHA(abhaId) {
        if (!abhaId || typeof abhaId !== 'string') {
            return false;
        }
        // Remove hyphens for validation
        const cleaned = abhaId.replace(/-/g, '');
        // Must be exactly 14 digits
        return /^\d{14}$/.test(cleaned);
    },

    /**
     * Validate Indian mobile number format
     * Must start with 6-9 and be exactly 10 digits
     * 
     * @param {string} mobile - Mobile number to validate
     * @returns {boolean} True if valid, false otherwise
     * @example
     * Validators.validateMobile('9876543210'); // true
     * Validators.validateMobile('1234567890'); // false
     */
    validateMobile(mobile) {
        if (!mobile || typeof mobile !== 'string') {
            return false;
        }
        // Remove spaces and hyphens
        const cleaned = mobile.replace(/[\s-]/g, '');
        // Must be 10 digits starting with 6-9
        return /^[6-9]\d{9}$/.test(cleaned);
    },

    /**
     * Validate email address format
     * Uses standard email regex pattern
     * 
     * @param {string} email - Email address to validate
     * @returns {boolean} True if valid, false otherwise
     * @example
     * Validators.validateEmail('user@example.com'); // true
     * Validators.validateEmail('invalid-email'); // false
     */
    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return false;
        }
        // Standard email regex
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    },

    /**
     * Validate age (must be between 0 and 150)
     * 
     * @param {number|string} age - Age to validate
     * @returns {boolean} True if valid, false otherwise
     * @example
     * Validators.validateAge(25); // true
     * Validators.validateAge(-5); // false
     * Validators.validateAge(200); // false
     */
    validateAge(age) {
        const numAge = typeof age === 'string' ? parseInt(age, 10) : age;
        return !isNaN(numAge) && numAge >= 0 && numAge <= 150;
    },

    /**
     * Validate password strength
     * Must be at least 6 characters (basic validation)
     * 
     * @param {string} password - Password to validate
     * @returns {boolean} True if valid, false otherwise
     * @example
     * Validators.validatePassword('mypass123'); // true
     * Validators.validatePassword('123'); // false
     */
    validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return false;
        }
        // Minimum 6 characters
        return password.length >= 6;
    },

    /**
     * Validate OTP (One-Time Password)
     * Must be exactly 6 digits
     * 
     * @param {string} otp - OTP to validate
     * @returns {boolean} True if valid, false otherwise
     * @example
     * Validators.validateOTP('123456'); // true
     * Validators.validateOTP('12345'); // false
     */
    validateOTP(otp) {
        if (!otp || typeof otp !== 'string') {
            return false;
        }
        // Must be exactly 6 digits
        return /^\d{6}$/.test(otp);
    },

    /**
     * Validate appointment date
     * Date must be in the future
     * 
     * @param {Date|string} date - Date to validate
     * @returns {boolean} True if valid future date, false otherwise
     * @example
     * Validators.validateAppointmentDate(new Date('2026-12-31')); // true
     * Validators.validateAppointmentDate('2020-01-01'); // false
     */
    validateAppointmentDate(date) {
        try {
            const appointmentDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time for date-only comparison

            // Must be a valid date and in the future
            return appointmentDate instanceof Date &&
                !isNaN(appointmentDate) &&
                appointmentDate >= today;
        } catch (error) {
            return false;
        }
    },

    /**
     * Validate appointment ID format
     * Must start with 'APT-' or 'PT-' followed by alphanumeric characters
     * 
     * @param {string} appointmentId - Appointment ID to validate
     * @returns {boolean} True if valid, false otherwise
     * @example
     * Validators.validateAppointmentId('APT-abc123'); // true
     * Validators.validateAppointmentId('invalid'); // false
     */
    validateAppointmentId(appointmentId) {
        if (!appointmentId || typeof appointmentId !== 'string') {
            return false;
        }
        // Must start with APT- or PT-
        return /^(APT-|PT-)[a-zA-Z0-9]+$/.test(appointmentId);
    },

    /**
     * Validate file upload
     * Checks file size and allowed extensions
     * 
     * @param {File} file - File object to validate
     * @param {Array<string>} allowedExtensions - Array of allowed extensions (e.g., ['.pdf', '.jpg'])
     * @param {number} maxSizeMB - Maximum file size in megabytes
     * @returns {Object} Validation result with success and message
     * @example
     * const result = Validators.validateFile(file, ['.pdf', '.jpg'], 5);
     * if (result.success) { // upload file }
     */
    validateFile(file, allowedExtensions = ['.pdf', '.jpg', '.png'], maxSizeMB = 10) {
        if (!file || !(file instanceof File)) {
            return { success: false, message: 'No file provided' };
        }

        // Check file size
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return {
                success: false,
                message: `File size must be less than ${maxSizeMB}MB`
            };
        }

        // Check file extension
        const fileName = file.name.toLowerCase();
        const hasValidExtension = allowedExtensions.some(ext =>
            fileName.endsWith(ext.toLowerCase())
        );

        if (!hasValidExtension) {
            return {
                success: false,
                message: `Only ${allowedExtensions.join(', ')} files are allowed`
            };
        }

        return { success: true, message: 'File is valid' };
    },

    /**
     * Validate required fields in a form
     * Checks if all required fields have values
     * 
     * @param {Object} formData - Object containing form field values
     * @param {Array<string>} requiredFields - Array of required field names
     * @returns {Object} Validation result with success and missing fields
     * @example
     * const result = Validators.validateRequiredFields(
     *   { name: 'John', age: 30 },
     *   ['name', 'age', 'email']
     * );
     * // Returns: { success: false, missingFields: ['email'] }
     */
    validateRequiredFields(formData, requiredFields) {
        const missingFields = requiredFields.filter(field => {
            const value = formData[field];
            return !value || (typeof value === 'string' && !value.trim());
        });

        return {
            success: missingFields.length === 0,
            missingFields: missingFields
        };
    },

    /**
     * Validate appointment status
     * Checks if status is one of the allowed values
     * 
     * @param {string} status - Status to validate
     * @returns {boolean} True if valid status, false otherwise
     * @example
     * Validators.validateStatus('confirmed'); // true
     * Validators.validateStatus('invalid'); // false
     */
    validateStatus(status) {
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        return validStatuses.includes(status?.toLowerCase());
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Validators;
}
