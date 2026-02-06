/**
 * @fileoverview Application-wide Constants
 * Centralizes all constant values used throughout the application
 * @module config/constants
 * @author SwasthyaSetu Team
 * @version 1.0.0
 */

/**
 * API Configuration Constants
 * Base URLs for different environments
 */
const API_CONFIG = {
    /** Local development API endpoint */
    LOCAL_API_URL: 'http://localhost:5000/api',

    /** Production API endpoint (Render deployment) */
    PRODUCTION_API_URL: 'https://swasthyasetu-9y5l.onrender.com/api',

    /** API request timeout in milliseconds */
    REQUEST_TIMEOUT: 30000,

    /** Maximum retries for failed requests */
    MAX_RETRIES: 3
};

/**
 * Appointment Status Constants
 * All possible appointment statuses
 */
const APPOINTMENT_STATUS = {
    /** Appointment is awaiting confirmation */
    PENDING: 'pending',

    /** Appointment has been confirmed */
    CONFIRMED: 'confirmed',

    /** Appointment was cancelled */
    CANCELLED: 'cancelled',

    /** Appointment has been completed */
    COMPLETED: 'completed'
};

/**
 * User Type Constants
 * Different types of users in the system
 */
const USER_TYPES = {
    /** Patient/ABHA user */
    PATIENT: 'patient',

    /** Hospital administrator */
    ADMIN: 'admin',

    /** Doctor */
    DOCTOR: 'doctor',

    /** Government official */
    GOVERNMENT: 'government'
};

/**
 * Document Type Constants
 * Types of medical documents that can be uploaded
 */
const DOCUMENT_TYPES = {
    /** Medical prescription */
    PRESCRIPTION: 'prescription',

    /** Lab report */
    REPORT: 'report',

    /** X-ray image */
    XRAY: 'xray',

    /** MRI scan */
    MRI: 'mri',

    /** CT scan */
    CT_SCAN: 'ct_scan',

    /** General medical document */
    OTHER: 'other'
};

/**
 * File Upload Constraints
 * Maximum file sizes and allowed extensions
 */
const FILE_UPLOAD_CONFIG = {
    /** Maximum file size in MB */
    MAX_FILE_SIZE_MB: 10,

    /** Allowed document file extensions */
    ALLOWED_DOCUMENT_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png'],

    /** Allowed image file extensions */
    ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif'],

    /** Maximum number of files per upload */
    MAX_FILES_PER_UPLOAD: 5
};

/**
 * Validation Regex Patterns
 * Regular expressions for input validation
 */
const VALIDATION_PATTERNS = {
    /** ABHA ID format (14 digits) */
    ABHA_ID: /^\d{14}$/,

    /** Indian mobile number (10 digits starting with 6-9) */
    MOBILE: /^[6-9]\d{9}$/,

    /** Email address */
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    /** OTP (6 digits) */
    OTP: /^\d{6}$/,

    /** Appointment ID (APT- or PT- prefix) */
    APPOINTMENT_ID: /^(APT-|PT-)[a-zA-Z0-9]+$/
};

/**
 * LocalStorage Keys
 * Keys used for storing data in localStorage
 */
const STORAGE_KEYS = {
    /** Current authenticated user */
    CURRENT_USER: 'swasthya_user',

    /** Authentication token */
    AUTH_TOKEN: 'swasthya_token',

    /** User appointments */
    APPOINTMENTS: 'swasthya_appointments',

    /** User location */
    LOCATION: 'swasthya_location',

    /** Location permission handled flag */
    LOCATION_HANDLED: 'swasthyasetu_location_handled',

    /** Dark mode preference */
    DARK_MODE: 'darkMode',

    /** Remembered credentials */
    REMEMBERED_CREDENTIALS: 'swasthya_remembered',

    /** AQI data cache */
    AQI_DATA: 'swasthyasetu_aqi'
};

/**
 * UI Constants
 * Constants related to UI behavior and display
 */
const UI_CONFIG = {
    /** Default toast notification duration in ms */
    TOAST_DURATION: 3000,

    /** Page size for paginated lists */
    DEFAULT_PAGE_SIZE: 10,

    /** Debounce delay for search inputs in ms */
    SEARCH_DEBOUNCE_DELAY: 300,

    /** Animation duration in ms */
    ANIMATION_DURATION: 300,

    /** Modal transition duration in ms */
    MODAL_TRANSITION_DURATION: 200
};

/**
 * Date/Time Constants
 * Constants related to date and time handling
 */
const DATE_TIME_CONFIG = {
    /** Date format options */
    DATE_FORMATS: {
        SHORT: 'short',
        LONG: 'long',
        TIME: 'time',
        DATETIME: 'datetime',
        RELATIVE: 'relative'
    },

    /** Appointment slot duration in minutes */
    APPOINTMENT_SLOT_DURATION: 30,

    /** Maximum days in advance for appointment booking */
    MAX_BOOKING_DAYS_AHEAD: 90
};

/**
 * Medical Departments
 * List of medical departments/specialties
 */
const MEDICAL_DEPARTMENTS = [
    'General Medicine',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Gynecology',
    'Dermatology',
    'ENT',
    'Ophthalmology',
    'Psychiatry',
    'Oncology',
    'Emergency',
    'Surgery'
];

/**
 * Error Messages
 * Standardized error messages
 */
const ERROR_MESSAGES = {
    /** Generic error message */
    GENERIC: 'Something went wrong. Please try again.',

    /** Network error */
    NETWORK: 'Network error. Please check your connection.',

    /** Authentication required */
    AUTH_REQUIRED: 'Please log in to continue.',

    /** Access denied */
    ACCESS_DENIED: 'You do not have permission to access this resource.',

    /** Invalid credentials */
    INVALID_CREDENTIALS: 'Invalid credentials. Please try again.',

    /** Session expired */
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',

    /** File upload error */
    FILE_UPLOAD_ERROR: 'Failed to upload file. Please try again.',

    /** File size exceeded */
    FILE_SIZE_EXCEEDED: 'File size exceeds the maximum allowed limit.',

    /** Invalid file type */
    INVALID_FILE_TYPE: 'Invalid file type. Please upload a valid file.',

    /** Required field missing */
    REQUIRED_FIELD: 'This field is required.',

    /** Invalid format */
    INVALID_FORMAT: 'Invalid format. Please check your input.'
};

/**
 * Success Messages
 * Standardized success messages
 */
const SUCCESS_MESSAGES = {
    /** Generic success */
    GENERIC: 'Operation completed successfully!',

    /** Login success */
    LOGIN_SUCCESS: 'Logged in successfully!',

    /** Logout success */
    LOGOUT_SUCCESS: 'Logged out successfully!',

    /** Appointment booked */
    APPOINTMENT_BOOKED: 'Appointment booked successfully!',

    /** Appointment updated */
    APPOINTMENT_UPDATED: 'Appointment updated successfully!',

    /** Document uploaded */
    DOCUMENT_UPLOADED: 'Document uploaded successfully!',

    /** Profile updated */
    PROFILE_UPDATED: 'Profile updated successfully!',

    /** Password changed */
    PASSWORD_CHANGED: 'Password changed successfully!'
};

/**
 * Get API base URL based on environment
 * Automatically detects if running locally or in production
 * 
 * @returns {string} API base URL
 */
function getApiBaseUrl() {
    if (typeof window === 'undefined') {
        return API_CONFIG.PRODUCTION_API_URL;
    }

    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

    return isLocal ? API_CONFIG.LOCAL_API_URL : API_CONFIG.PRODUCTION_API_URL;
}

// Export all constants
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_CONFIG,
        APPOINTMENT_STATUS,
        USER_TYPES,
        DOCUMENT_TYPES,
        FILE_UPLOAD_CONFIG,
        VALIDATION_PATTERNS,
        STORAGE_KEYS,
        UI_CONFIG,
        DATE_TIME_CONFIG,
        MEDICAL_DEPARTMENTS,
        ERROR_MESSAGES,
        SUCCESS_MESSAGES,
        getApiBaseUrl
    };
}
