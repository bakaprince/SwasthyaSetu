/**
 * @fileoverview Appointment Controller
 * Handles all appointment-related API endpoints for the SwasthyaSetu healthcare platform.
 * 
 * This controller manages:
 * - Patient appointment booking and retrieval
 * - Hospital admin appointment management
 * - Document uploads (prescriptions, reports, x-rays)
 * - Appointment status updates and cancellations
 * - Inter-hospital transfer requests
 * 
 * @module controllers/appointmentController
 * @author SwasthyaSetu Team
 * @version 2.0.0
 * @requires mongoose - MongoDB ODM for database operations
 * @requires ../models/Appointment - Appointment schema model
 * @requires ../models/Hospital - Hospital schema model
 */

// =============================================================================
// IMPORTS & DEPENDENCIES
// =============================================================================

const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Hospital = require('../models/Hospital');

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * @constant {Object} APPOINTMENT_STATUS
 * @description Enum-like object defining valid appointment status values.
 *              Using constants prevents typos and enables IDE autocomplete.
 */
const APPOINTMENT_STATUS = {
    /** Initial state when patient books appointment */
    PENDING: 'pending',
    /** Hospital admin has confirmed the appointment */
    CONFIRMED: 'confirmed',
    /** Appointment visit has been completed */
    COMPLETED: 'completed',
    /** Appointment was cancelled by patient or admin */
    CANCELLED: 'cancelled'
};

/**
 * @constant {Object} DOCUMENT_TYPES
 * @description Valid document types that can be attached to appointments.
 */
const DOCUMENT_TYPES = {
    PRESCRIPTION: 'prescription',
    REPORT: 'report',
    XRAY: 'x-ray',
    SCAN: 'scan',
    OTHER: 'other'
};

/**
 * @constant {Object} TRANSFER_STATUS
 * @description Transfer request status values for inter-hospital referrals.
 */
const TRANSFER_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};

/**
 * @constant {string} FALLBACK_HOSPITAL_ID
 * @description Generic ObjectId used as fallback for external/unregistered hospitals.
 *              This allows booking with hospitals not yet in our database.
 */
const FALLBACK_HOSPITAL_ID = '507f1f77bcf86cd799439011';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Find an existing hospital or auto-create a new one.
 * 
 * This helper centralizes hospital lookup logic used during appointment creation.
 * It attempts to find a hospital by:
 *   1. MongoDB ObjectId (if valid)
 *   2. Hospital name (case-sensitive match)
 *   3. Auto-creates new hospital if not found
 * 
 * @async
 * @param {string} hospitalId - MongoDB ObjectId or fallback ID
 * @param {string} hospitalName - Hospital name from user input
 * @param {string} hospitalAddress - Hospital address from user input
 * @returns {Promise<Object|null>} Hospital document or null if creation fails
 * 
 * @example
 * // Find existing hospital
 * const hospital = await findOrCreateHospital('60d5ec49f1b2c8b1f8c1e1a1', 'AIIMS Delhi', 'New Delhi');
 * 
 * // Auto-create new hospital
 * const newHospital = await findOrCreateHospital(null, 'City Hospital', 'Mumbai, Maharashtra');
 */
async function findOrCreateHospital(hospitalId, hospitalName, hospitalAddress) {
    let dbHospital = null;

    // Step 1: Try finding by MongoDB ObjectId
    // Only attempt if hospitalId is a valid ObjectId AND not our fallback ID
    if (mongoose.Types.ObjectId.isValid(hospitalId) && hospitalId !== FALLBACK_HOSPITAL_ID) {
        dbHospital = await Hospital.findById(hospitalId);

        if (dbHospital) {
            console.log(`[findOrCreateHospital] Found hospital by ID: ${dbHospital.name}`);
            return dbHospital;
        }
    }

    // Step 2: Try finding by hospital name
    if (hospitalName) {
        dbHospital = await Hospital.findOne({ name: hospitalName });

        if (dbHospital) {
            console.log(`[findOrCreateHospital] Found hospital by name: ${dbHospital.name}`);
            return dbHospital;
        }
    }

    // Step 3: Auto-create new hospital (auto-onboarding)
    // This allows patients to book with hospitals not yet in our system
    if (hospitalName) {
        try {
            // Extract city from address (assumes format: "Street, Area, City")
            let city = 'Unknown City';
            if (hospitalAddress) {
                const addressParts = hospitalAddress.split(',');
                if (addressParts.length > 1) {
                    // Take the last part as city (e.g., "Mumbai" from "123 Main St, Andheri, Mumbai")
                    city = addressParts[addressParts.length - 1].trim();
                }
            }

            // Create new hospital record
            dbHospital = await Hospital.create({
                name: hospitalName,
                address: hospitalAddress || 'Address not provided',
                city: city,
                type: 'Private',  // Default type for auto-created hospitals
                contact: {
                    phone: '0000000000',  // Placeholder - to be updated by hospital admin
                    emergency: '108'       // Default emergency number
                }
            });

            console.log(`[findOrCreateHospital] Auto-onboarded new hospital: ${hospitalName}`);
            return dbHospital;

        } catch (createError) {
            // Log error but don't throw - we can still create appointment with text-only hospital
            console.error('[findOrCreateHospital] Error auto-creating hospital:', createError.message);
            return null;
        }
    }

    return null;
}

/**
 * Build standardized success response object.
 * Ensures consistent API response format across all endpoints.
 * 
 * @param {string} message - Human-readable success message
 * @param {Object|Array} data - Response payload (single object or array)
 * @param {Object} [extras={}] - Additional fields to include (e.g., count, pagination)
 * @returns {Object} Formatted response object
 * 
 * @example
 * // Simple response
 * res.json(buildSuccessResponse('Appointment created', appointment));
 * 
 * // With extras
 * res.json(buildSuccessResponse('Appointments retrieved', appointments, { count: 10 }));
 */
function buildSuccessResponse(message, data, extras = {}) {
    return {
        success: true,
        message,
        data,
        ...extras
    };
}

/**
 * Build standardized error response object.
 * Ensures consistent error format for client-side handling.
 * 
 * @param {string} message - Human-readable error message
 * @param {string} [code=null] - Optional error code for programmatic handling
 * @returns {Object} Formatted error response object
 * 
 * @example
 * res.status(404).json(buildErrorResponse('Appointment not found', 'NOT_FOUND'));
 */
function buildErrorResponse(message, code = null) {
    const response = {
        success: false,
        message
    };

    if (code) {
        response.code = code;
    }

    return response;
}

// =============================================================================
// CONTROLLER FUNCTIONS
// Sorted alphabetically for easier navigation
// =============================================================================

/**
 * Cancel an existing appointment.
 * 
 * Allows both patients (their own appointments) and hospital admins to cancel.
 * Sets status to 'cancelled' but preserves the record for history.
 * 
 * @async
 * @function cancelAppointment
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Appointment MongoDB ObjectId
 * @param {Object} req.user - Authenticated user from JWT middleware
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends JSON response
 * 
 * @route DELETE /api/appointments/:id
 * @access Private (Patient owner or Admin)
 * 
 * @example
 * // Request
 * DELETE /api/appointments/60d5ec49f1b2c8b1f8c1e1a1
 * Authorization: Bearer <token>
 * 
 * // Response
 * {
 *   "success": true,
 *   "message": "Appointment cancelled successfully",
 *   "data": { ... appointment object ... }
 * }
 */
const cancelAppointment = async (req, res, next) => {
    try {
        // Find the appointment by ID
        const appointment = await Appointment.findById(req.params.id);

        // Guard: Check if appointment exists
        if (!appointment) {
            return res.status(404).json(
                buildErrorResponse('Appointment not found', 'NOT_FOUND')
            );
        }

        // Authorization: User must own the appointment OR be an admin
        const isOwner = appointment.userId.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json(
                buildErrorResponse('Not authorized to cancel this appointment', 'FORBIDDEN')
            );
        }

        // Update status to cancelled
        appointment.status = APPOINTMENT_STATUS.CANCELLED;

        // Save changes to database
        await appointment.save();

        // Send success response
        res.json(buildSuccessResponse('Appointment cancelled successfully', appointment));

    } catch (error) {
        // Pass to error handling middleware
        next(error);
    }
};

/**
 * Create a new appointment request.
 * 
 * Patients use this endpoint to book appointments. The system will:
 *   1. Find or auto-create the hospital record
 *   2. Create appointment with 'pending' status
 *   3. Return the created appointment with hospital details
 * 
 * @async
 * @function createAppointment
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing appointment details
 * @param {string} [req.body.hospitalId] - MongoDB ObjectId of hospital (optional)
 * @param {string} req.body.hospital - Hospital name
 * @param {string} [req.body.hospitalAddress] - Hospital address
 * @param {string} req.body.doctor - Doctor's name
 * @param {string} req.body.specialty - Medical specialty (e.g., 'Cardiology')
 * @param {Date} req.body.date - Appointment date
 * @param {string} req.body.time - Appointment time (e.g., '10:30 AM')
 * @param {string} req.body.type - Appointment type ('In-person' or 'Telemedicine')
 * @param {string} [req.body.reason] - Reason for visit
 * @param {Object} req.user - Authenticated user from JWT middleware
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends JSON response with created appointment
 * 
 * @route POST /api/appointments
 * @access Private (Patient)
 * 
 * @example
 * // Request
 * POST /api/appointments
 * Content-Type: application/json
 * Authorization: Bearer <token>
 * {
 *   "hospital": "AIIMS Delhi",
 *   "hospitalAddress": "Ansari Nagar, New Delhi",
 *   "doctor": "Dr. Sharma",
 *   "specialty": "Cardiology",
 *   "date": "2026-03-15",
 *   "time": "10:30 AM",
 *   "type": "In-person",
 *   "reason": "Routine checkup"
 * }
 */
const createAppointment = async (req, res, next) => {
    try {
        // Destructure appointment details from request body
        const {
            hospitalId,
            hospital,
            hospitalAddress,
            doctor,
            specialty,
            date,
            time,
            type,
            reason
        } = req.body;

        // Initialize hospital details with provided values
        let finalHospitalName = hospital;
        let finalHospitalAddress = hospitalAddress;
        let finalHospitalId = hospitalId;

        // Attempt to find or create hospital record
        const dbHospital = await findOrCreateHospital(hospitalId, hospital, hospitalAddress);

        // Update details if we found/created a hospital in our database
        if (dbHospital) {
            finalHospitalName = dbHospital.name;
            finalHospitalAddress = dbHospital.address;
            finalHospitalId = dbHospital._id;  // Use the actual DB ID
        }

        // Fallback: Ensure we have a hospital name
        if (!finalHospitalName) {
            finalHospitalName = 'Unknown Hospital';
        }

        // Create the appointment record
        const appointment = await Appointment.create({
            userId: req.user.id,                    // Patient's user ID from JWT
            hospitalId: finalHospitalId,            // Hospital reference (ObjectId or fallback)
            hospital: finalHospitalName,            // Hospital name (denormalized for display)
            hospitalAddress: finalHospitalAddress,  // Address (denormalized for display)
            doctor,                                 // Doctor's name
            specialty,                              // Medical specialty
            date,                                   // Appointment date
            time,                                   // Appointment time
            type,                                   // In-person or Telemedicine
            reason,                                 // Reason for visit
            status: APPOINTMENT_STATUS.PENDING      // Initial status
        });

        // Build response with hospital details
        // We construct this manually instead of populate() because hospitalId might be a string
        const responseData = appointment.toObject();
        responseData.hospitalId = {
            _id: appointment.hospitalId,
            name: finalHospitalName,
            city: finalHospitalAddress,
            address: finalHospitalAddress
        };

        // Send success response with 201 Created status
        res.status(201).json(
            buildSuccessResponse('Appointment request created successfully', responseData)
        );

    } catch (error) {
        next(error);
    }
};

/**
 * Delete a document from an appointment.
 * 
 * Removes a document at the specified index from the appointment's documents array.
 * Only hospital admins from the same hospital can delete documents.
 * 
 * @async
 * @function deleteDocument
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Appointment MongoDB ObjectId
 * @param {string} req.params.docIndex - Array index of document to delete
 * @param {Object} req.user - Authenticated user from JWT middleware
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends JSON response with updated documents array
 * 
 * @route DELETE /api/appointments/:id/documents/:docIndex
 * @access Private (Admin only)
 * 
 * @example
 * // Request - Delete first document (index 0)
 * DELETE /api/appointments/60d5ec49f1b2c8b1f8c1e1a1/documents/0
 * Authorization: Bearer <admin-token>
 */
const deleteDocument = async (req, res, next) => {
    try {
        // Extract parameters
        const { id, docIndex } = req.params;

        // Find the appointment
        const appointment = await Appointment.findById(id);

        // Guard: Check if appointment exists
        if (!appointment) {
            return res.status(404).json(
                buildErrorResponse('Appointment not found', 'NOT_FOUND')
            );
        }

        // Authorization: Only admin from same hospital can delete documents
        const isAdminOfHospital = (
            req.user.role === 'admin' &&
            appointment.hospitalId.toString() === req.user.hospitalId.toString()
        );

        if (!isAdminOfHospital) {
            return res.status(403).json(
                buildErrorResponse('Not authorized to delete documents', 'FORBIDDEN')
            );
        }

        // Parse index and validate document exists
        const index = parseInt(docIndex, 10);

        if (!appointment.documents || !appointment.documents[index]) {
            return res.status(404).json(
                buildErrorResponse('Document not found at specified index', 'DOC_NOT_FOUND')
            );
        }

        // Remove document from array using splice
        // splice(index, 1) removes 1 element at the specified index
        appointment.documents.splice(index, 1);

        // Save updated appointment
        await appointment.save();

        // Send success response with remaining documents
        res.json(buildSuccessResponse('Document deleted successfully', appointment.documents));

    } catch (error) {
        next(error);
    }
};

/**
 * Get all appointments for the authenticated patient.
 * 
 * Returns all appointments belonging to the logged-in user, sorted by date (newest first).
 * Each appointment includes populated hospital details.
 * 
 * @async
 * @function getAppointments
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user from JWT middleware
 * @param {string} req.user.id - User's MongoDB ObjectId
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends JSON response with appointments array
 * 
 * @route GET /api/appointments
 * @access Private (Patient)
 * 
 * @example
 * // Request
 * GET /api/appointments
 * Authorization: Bearer <patient-token>
 * 
 * // Response
 * {
 *   "success": true,
 *   "count": 5,
 *   "data": [ ... array of appointments ... ]
 * }
 */
const getAppointments = async (req, res, next) => {
    try {
        // Query appointments for the authenticated user
        // populate() joins the hospitalId reference to get hospital details
        // sort({ date: -1 }) orders by date descending (newest first)
        const appointments = await Appointment.find({ userId: req.user.id })
            .populate('hospitalId', 'name city address contact')
            .sort({ date: -1 });

        // Send response with count for client convenience
        res.json(buildSuccessResponse(
            'Appointments retrieved successfully',
            appointments,
            { count: appointments.length }
        ));

    } catch (error) {
        next(error);
    }
};

/**
 * Get all appointments for a hospital (admin view).
 * 
 * Returns all appointments at the admin's hospital. Supports optional status filtering.
 * Each appointment includes populated patient details.
 * 
 * @async
 * @function getHospitalAppointments
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query string parameters
 * @param {string} [req.query.status] - Optional status filter (pending, confirmed, etc.)
 * @param {Object} req.user - Authenticated admin user from JWT middleware
 * @param {string} req.user.hospitalId - Admin's hospital MongoDB ObjectId
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends JSON response with appointments array
 * 
 * @route GET /api/appointments/hospital
 * @access Private (Admin only)
 * 
 * @example
 * // Get all appointments
 * GET /api/appointments/hospital
 * 
 * // Get only pending appointments
 * GET /api/appointments/hospital?status=pending
 */
const getHospitalAppointments = async (req, res, next) => {
    try {
        // Extract optional status filter from query string
        const { status } = req.query;

        // Build query object - always filter by admin's hospital
        const query = { hospitalId: req.user.hospitalId };

        // Add optional status filter if provided
        if (status && Object.values(APPOINTMENT_STATUS).includes(status)) {
            query.status = status;
        }

        // Execute query with patient details populated
        // Sort by date (newest first), then by creation time for same-day appointments
        const appointments = await Appointment.find(query)
            .populate('userId', 'name abhaId mobile age gender')
            .sort({ date: -1, createdAt: -1 });

        // Send response
        res.json(buildSuccessResponse(
            'Hospital appointments retrieved successfully',
            appointments,
            { count: appointments.length }
        ));

    } catch (error) {
        next(error);
    }
};

/**
 * Handle inter-hospital transfer request (approve/reject).
 * 
 * Hospital admins can approve or reject transfer requests for patients
 * being referred from other hospitals.
 * 
 * @async
 * @function handleTransfer
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Appointment MongoDB ObjectId
 * @param {Object} req.body - Request body
 * @param {string} req.body.action - 'approve' or 'reject'
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends JSON response
 * 
 * @route PUT /api/appointments/:id/transfer
 * @access Private (Admin only)
 * 
 * @example
 * // Approve transfer
 * PUT /api/appointments/60d5ec49f1b2c8b1f8c1e1a1/transfer
 * { "action": "approve" }
 */
const handleTransfer = async (req, res, next) => {
    try {
        // Extract action from request body
        const { action } = req.body;

        // Find the appointment
        const appointment = await Appointment.findById(req.params.id);

        // Guard: Check if appointment exists
        if (!appointment) {
            return res.status(404).json(
                buildErrorResponse('Appointment not found', 'NOT_FOUND')
            );
        }

        // Process transfer action
        if (action === 'approve') {
            // Mark transfer as approved
            appointment.transferStatus = TRANSFER_STATUS.APPROVED;

            // Append approval note to existing notes
            appointment.notes = (appointment.notes || '') + ' [Transfer Approved]';

        } else if (action === 'reject') {
            // Mark transfer as rejected
            appointment.transferStatus = TRANSFER_STATUS.REJECTED;

        } else {
            // Invalid action provided
            return res.status(400).json(
                buildErrorResponse('Invalid action. Use "approve" or "reject"', 'INVALID_ACTION')
            );
        }

        // Save changes
        await appointment.save();

        // Send success response with action confirmation
        res.json(buildSuccessResponse(`Transfer ${action}d successfully`, appointment));

    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing appointment.
 * 
 * Hospital admins use this to update appointment status, add notes, or handle cancellations.
 * Automatically tracks confirmation and cancellation metadata.
 * 
 * @async
 * @function updateAppointment
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Appointment MongoDB ObjectId
 * @param {Object} req.body - Request body with update fields
 * @param {string} [req.body.status] - New status value
 * @param {string} [req.body.notes] - Admin notes
 * @param {string} [req.body.transferStatus] - Transfer status if applicable
 * @param {string} [req.body.cancelReason] - Reason for cancellation (required if status=cancelled)
 * @param {Object} req.user - Authenticated admin user
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends JSON response with updated appointment
 * 
 * @route PUT /api/appointments/:id
 * @access Private (Admin only)
 * 
 * @example
 * // Confirm appointment
 * PUT /api/appointments/60d5ec49f1b2c8b1f8c1e1a1
 * { "status": "confirmed" }
 * 
 * // Cancel with reason
 * PUT /api/appointments/60d5ec49f1b2c8b1f8c1e1a1
 * { "status": "cancelled", "cancelReason": "Doctor unavailable" }
 */
const updateAppointment = async (req, res, next) => {
    try {
        // Extract update fields from request body
        const { status, notes, transferStatus, cancelReason } = req.body;

        // Find the appointment
        let appointment = await Appointment.findById(req.params.id);

        // Guard: Check if appointment exists
        if (!appointment) {
            return res.status(404).json(
                buildErrorResponse('Appointment not found', 'NOT_FOUND')
            );
        }

        // Authorization: Admin must belong to the same hospital
        const isAdminOfHospital = (
            req.user.role === 'admin' &&
            appointment.hospitalId.toString() === req.user.hospitalId.toString()
        );

        if (!isAdminOfHospital) {
            return res.status(403).json(
                buildErrorResponse('Not authorized to update this appointment', 'FORBIDDEN')
            );
        }

        // --- Apply Updates ---

        // Update status if provided
        if (status) {
            appointment.status = status;
        }

        // Update notes if provided
        if (notes) {
            appointment.notes = notes;
        }

        // Update transfer status if provided
        if (transferStatus) {
            appointment.transferStatus = transferStatus;
        }

        // Track confirmation metadata
        // Only set when status changes TO confirmed (not if already confirmed)
        if (status === APPOINTMENT_STATUS.CONFIRMED && appointment.status !== APPOINTMENT_STATUS.CONFIRMED) {
            appointment.confirmedBy = req.user.id;
            appointment.confirmedAt = Date.now();
        }

        // Track cancellation metadata
        // Stores reason, who cancelled, and when
        if (status === APPOINTMENT_STATUS.CANCELLED) {
            appointment.cancelReason = cancelReason || 'No reason provided';
            appointment.cancelledBy = req.user.id;
            appointment.cancelledAt = Date.now();
        }

        // Save all changes to database
        await appointment.save();

        // Populate references for response
        // This gives the client full details without additional API calls
        await appointment.populate('userId', 'name abhaId mobile age gender');
        await appointment.populate('hospitalId', 'name city');

        // Send success response
        res.json(buildSuccessResponse('Appointment updated successfully', appointment));

    } catch (error) {
        next(error);
    }
};

/**
 * Upload a document to an appointment.
 * 
 * Allows hospital admins to attach prescriptions, reports, x-rays, etc. to appointments.
 * Supports both file uploads (via multer) and direct URL references.
 * 
 * @async
 * @function uploadDocument
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Appointment MongoDB ObjectId
 * @param {Object} req.body - Request body
 * @param {string} [req.body.type='prescription'] - Document type
 * @param {string} [req.body.notes] - Notes about the document
 * @param {string} [req.body.url] - Direct URL to document (if not uploading file)
 * @param {Object} [req.file] - Uploaded file from multer middleware
 * @param {Object} req.user - Authenticated admin user
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends JSON response with updated documents array
 * 
 * @route POST /api/appointments/:id/documents
 * @access Private (Admin only)
 * 
 * @example
 * // Upload file (multipart form data)
 * POST /api/appointments/60d5ec49f1b2c8b1f8c1e1a1/documents
 * Content-Type: multipart/form-data
 * type: prescription
 * file: <binary>
 * 
 * // Upload via URL
 * POST /api/appointments/60d5ec49f1b2c8b1f8c1e1a1/documents
 * { "type": "report", "url": "https://example.com/report.pdf" }
 */
const uploadDocument = async (req, res, next) => {
    try {
        // Extract document metadata from request body
        const { type, notes } = req.body;

        // Determine file URL - either from uploaded file or direct URL
        let fileUrl = req.body.url;

        // If a file was uploaded via multer, use its path
        if (req.file) {
            // Store relative path - frontend/backend will prepend host as needed
            fileUrl = `/uploads/reports/${req.file.filename}`;
        }

        // Find the appointment
        const appointment = await Appointment.findById(req.params.id);

        // Guard: Check if appointment exists
        if (!appointment) {
            return res.status(404).json(
                buildErrorResponse('Appointment not found', 'NOT_FOUND')
            );
        }

        // Authorization: Only admin from same hospital can upload documents
        const isAdminOfHospital = (
            req.user.role === 'admin' &&
            appointment.hospitalId.toString() === req.user.hospitalId.toString()
        );

        if (!isAdminOfHospital) {
            return res.status(403).json(
                buildErrorResponse('Not authorized to upload documents', 'FORBIDDEN')
            );
        }

        // Validate: Must have either file upload or URL
        if (!fileUrl) {
            return res.status(400).json(
                buildErrorResponse('No file or URL provided', 'MISSING_FILE')
            );
        }

        // Create new document object
        const newDocument = {
            type: type || DOCUMENT_TYPES.PRESCRIPTION,  // Default to prescription
            url: fileUrl,
            notes: notes || '',
            uploadedBy: req.user.id,
            uploadedAt: Date.now()
        };

        // Add document to appointment's documents array
        appointment.documents.push(newDocument);

        // Save updated appointment
        await appointment.save();

        // Send success response with all documents
        res.json(buildSuccessResponse('Document uploaded successfully', appointment.documents));

    } catch (error) {
        next(error);
    }
};

// =============================================================================
// MODULE EXPORTS
// Exported alphabetically for consistency
// =============================================================================

module.exports = {
    cancelAppointment,
    createAppointment,
    deleteDocument,
    getAppointments,
    getHospitalAppointments,
    handleTransfer,
    updateAppointment,
    uploadDocument
};
