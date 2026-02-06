/**
 * @fileoverview Appointment Management Service
 * Centralized service for all appointment-related operations
 * Handles API calls, local storage, and business logic for appointments
 * @module services/appointment
 * @author SwasthyaSetu Team
 * @version 1.0.0
 */

const AppointmentService = {
    /**
     * Fetch appointments for hospital admin
     * Attempts to fetch from API, falls back to localStorage if offline or unauthorized
     * 
     * @param {string} hospitalId - Optional hospital identifier for filtering
     * @returns {Promise<Array>} Array of appointment objects
     * @throws {Error} If both API and localStorage fail
     * @example
     * const appointments = await AppointmentService.fetchAppointments();
     * console.log(appointments);
     */
    async fetchAppointments(hospitalId = null) {
        try {
            // Check for authentication
            const token = AuthService.currentUser?.token;
            const userType = AuthService.currentUser?.type;

            // If no token or not admin, use local data
            if (!token || userType !== 'admin') {
                console.log('[AppointmentService] No admin credentials, using local data');
                return this.getLocalAppointments();
            }

            // Determine API endpoint based on environment
            const apiBaseUrl = getApiBaseUrl();
            const endpoint = hospitalId
                ? `${apiBaseUrl}/appointments/hospital/${hospitalId}`
                : `${apiBaseUrl}/appointments/hospital`;

            // Make API request
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                timeout: API_CONFIG.REQUEST_TIMEOUT
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log('[AppointmentService] Fetched appointments from API:', data.length);

            // Cache appointments locally
            this.cacheAppointments(data);

            return data;
        } catch (error) {
            console.error('[AppointmentService] Error fetching appointments:', error);

            // Fallback to local data
            console.log('[AppointmentService] Falling back to local data');
            return this.getLocalAppointments();
        }
    },

    /**
     * Get appointments from localStorage
     * Combines stored appointments with demo data
     * 
     * @returns {Array} Array of appointments from local storage
     * @private
     */
    getLocalAppointments() {
        try {
            // Get stored appointments
            const stored = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
            const localAppointments = stored ? JSON.parse(stored) : [];

            // Get demo/hardcoded appointments
            const demoAppointments = this.getDemoAppointments();

            // Combine and deduplicate (local takes precedence)
            const combinedMap = new Map();

            [...demoAppointments, ...localAppointments].forEach(apt => {
                combinedMap.set(apt._id, apt);
            });

            const appointments = Array.from(combinedMap.values());
            console.log('[AppointmentService] Loaded appointments from local storage:', appointments.length);

            return appointments;
        } catch (error) {
            console.error('[AppointmentService] Error reading local appointments:', error);
            return this.getDemoAppointments();
        }
    },

    /**
     * Get hardcoded demo appointments
     * Used for demonstration and offline mode
     * 
     * @returns {Array} Array of demo appointments
     * @private
     */
    getDemoAppointments() {
        return [
            {
                _id: 'APT-001',
                patientId: 'PT-001',
                patientName: 'Rahul Kumar',
                abhaId: '12-3456-7890-1234',
                date: '2026-02-20T10:00:00',
                status: APPOINTMENT_STATUS.PENDING,
                specialty: 'General Medicine',
                condition: 'Regular checkup',
                description: 'Scheduled with Dr. Nair at Pushpa Kalyan Hospital.',
                reason: 'Routine health checkup',
                userId: {
                    name: 'Rahul Kumar',
                    mobile: '9876543210',
                    age: 34,
                    gender: 'Male'
                },
                documents: []
            },
            {
                _id: 'APT-002',
                patientId: 'PT-001',
                patientName: 'Rahul Kumar',
                abhaId: '12-3456-7890-1234',
                date: '2026-02-14T10:00:00',
                status: APPOINTMENT_STATUS.CONFIRMED,
                specialty: 'Cardiology',
                condition: 'General consultation',
                description: 'Scheduled with Dr. Gupta at Khan Shakir Ali Khan Aspataal.',
                reason: 'Heart checkup',
                userId: {
                    name: 'Rahul Kumar',
                    mobile: '9876543210',
                    age: 34,
                    gender: 'Male'
                },
                documents: []
            }
        ];
    },

    /**
     * Cache appointments to localStorage
     * 
     * @param {Array} appointments - Appointments to cache
     * @private
     */
    cacheAppointments(appointments) {
        try {
            localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
        } catch (error) {
            console.error('[AppointmentService] Error caching appointments:', error);
        }
    },

    /**
     * Update appointment status
     * Updates via API if authenticated, otherwise updates locally
     * 
     * @param {string} appointmentId - Appointment ID to update
     * @param {string} newStatus - New status value (from APPOINTMENT_STATUS constants)
     * @returns {Promise<Object>} Updated appointment object
     * @throws {Error} If update fails
     * @example
     * await AppointmentService.updateStatus('APT-001', 'confirmed');
     */
    async updateStatus(appointmentId, newStatus) {
        try {
            // Validate status
            if (!Object.values(APPOINTMENT_STATUS).includes(newStatus)) {
                throw new Error(`Invalid status: ${newStatus}`);
            }

            const token = AuthService.currentUser?.token;
            const userType = AuthService.currentUser?.type;

            // For local/demo mode, update localStorage
            if (!token || userType !== 'admin' || appointmentId.startsWith('APT-') || appointmentId.startsWith('PT-')) {
                console.log(`[AppointmentService] Updating status locally for ${appointmentId} to ${newStatus}`);
                return this.updateStatusLocally(appointmentId, newStatus);
            }

            // API update for authenticated admin
            const apiBaseUrl = getApiBaseUrl();
            const response = await fetch(`${apiBaseUrl}/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error(`Failed to update status: ${response.status}`);
            }

            const updatedAppointment = await response.json();
            console.log('[AppointmentService] Status updated successfully via API');

            // Update local cache
            this.updateStatusLocally(appointmentId, newStatus);

            return updatedAppointment;
        } catch (error) {
            console.error('[AppointmentService] Error updating status:', error);
            throw error;
        }
    },

    /**
     * Update appointment status in localStorage
     * 
     * @param {string} appointmentId - Appointment ID
     * @param {string} newStatus - New status
     * @returns {Object} Updated appointment
     * @private
     */
    updateStatusLocally(appointmentId, newStatus) {
        try {
            const appointments = this.getLocalAppointments();
            const appointment = appointments.find(a => a._id === appointmentId);

            if (appointment) {
                appointment.status = newStatus;
                appointment.updatedAt = new Date().toISOString();

                // Save back to localStorage
                const stored = appointments.filter(a =>
                    !a._id.startsWith('APT-DEMO') // Exclude hardcoded demos
                );
                localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(stored));

                console.log('[AppointmentService] Status updated locally');
                return appointment;
            }

            throw new Error('Appointment not found');
        } catch (error) {
            console.error('[AppointmentService] Error updating status locally:', error);
            throw error;
        }
    },

    /**
     * Upload document to appointment
     * Simulates upload for local appointments, uses API for real appointments
     * 
     * @param {string} appointmentId - Appointment ID
     * @param {File} file - File to upload
     * @param {string} documentType - Type of document (from DOCUMENT_TYPES constants)
     * @returns {Promise<Object>} Upload response with document metadata
     * @throws {Error} If upload fails
     * @example
     * const result = await AppointmentService.uploadDocument(
     *   'APT-001',
     *   fileInput.files[0],
     *   'prescription'
     * );
     */
    async uploadDocument(appointmentId, file, documentType) {
        try {
            // Validate file
            const validation = Validators.validateFile(
                file,
                FILE_UPLOAD_CONFIG.ALLOWED_DOCUMENT_EXTENSIONS,
                FILE_UPLOAD_CONFIG.MAX_FILE_SIZE_MB
            );

            if (!validation.success) {
                throw new Error(validation.message);
            }

            const token = AuthService.currentUser?.token;

            // For local/demo mode, simulate upload
            if (!token || appointmentId.startsWith('APT-') || appointmentId.startsWith('PT-')) {
                console.log('[AppointmentService] Simulating document upload');
                return this.simulateDocumentUpload(appointmentId, file, documentType);
            }

            // Real API upload for authenticated users
            const apiBaseUrl = getApiBaseUrl();
            const formData = new FormData();
            formData.append('document', file);
            formData.append('type', documentType);

            const response = await fetch(`${apiBaseUrl}/appointments/${appointmentId}/documents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }

            const result = await response.json();
            console.log('[AppointmentService] Document uploaded successfully via API');

            return result;
        } catch (error) {
            console.error('[AppointmentService] Error uploading document:', error);
            throw error;
        }
    },

    /**
     * Simulate document upload for local/demo mode
     * 
     * @param {string} appointmentId - Appointment ID
     * @param {File} file - File object
     * @param {string} documentType - Document type
     * @returns {Promise<Object>} Simulated upload response
     * @private
     */
    async simulateDocumentUpload(appointmentId, file, documentType) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const appointments = this.getLocalAppointments();
        const appointment = appointments.find(a => a._id === appointmentId);

        if (appointment) {
            const document = {
                id: `DOC-${Date.now()}`,
                type: documentType,
                name: file.name,
                size: file.size,
                url: '#', // Placeholder for demo
                uploadedAt: new Date().toISOString()
            };

            if (!appointment.documents) {
                appointment.documents = [];
            }
            appointment.documents.push(document);

            // Update localStorage
            const stored = appointments.filter(a =>
                !a._id.startsWith('APT-DEMO')
            );
            localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(stored));

            console.log('[AppointmentService] Document upload simulated');
            return document;
        }

        throw new Error('Appointment not found');
    },

    /**
     * Get appointment by ID
     * 
     * @param {string} appointmentId - Appointment ID
     * @returns {Object|null} Appointment object or null if not found
     * @example
     * const appointment = AppointmentService.getAppointmentById('APT-001');
     */
    getAppointmentById(appointmentId) {
        const appointments = this.getLocalAppointments();
        return appointments.find(a => a._id === appointmentId) || null;
    },

    /**
     * Create new appointment
     * 
     * @param {Object} appointmentData - Appointment data
     * @returns {Promise<Object>} Created appointment
     * @throws {Error} If creation fails
     * @example
     * const newAppointment = await AppointmentService.createAppointment({
     *   patientName: 'John Doe',
     *   date: '2026-03-15T10:00:00',
     *   specialty: 'Cardiology'
     * });
     */
    async createAppointment(appointmentData) {
        try {
            const token = AuthService.currentUser?.token;

            if (!token) {
                // Create locally for demo
                return this.createAppointmentLocally(appointmentData);
            }

            const apiBaseUrl = getApiBaseUrl();
            const response = await fetch(`${apiBaseUrl}/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(appointmentData)
            });

            if (!response.ok) {
                throw new Error(`Failed to create appointment: ${response.status}`);
            }

            const newAppointment = await response.json();
            console.log('[AppointmentService] Appointment created via API');

            return newAppointment;
        } catch (error) {
            console.error('[AppointmentService] Error creating appointment:', error);
            throw error;
        }
    },

    /**
     * Create appointment locally
     * 
     * @param {Object} appointmentData - Appointment data
     * @returns {Object} Created appointment
     * @private
     */
    createAppointmentLocally(appointmentData) {
        const newAppointment = {
            _id: `APT-${Date.now()}`,
            ...appointmentData,
            status: APPOINTMENT_STATUS.PENDING,
            createdAt: new Date().toISOString(),
            documents: []
        };

        const appointments = this.getLocalAppointments();
        appointments.push(newAppointment);

        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
        console.log('[AppointmentService] Appointment created locally');

        return newAppointment;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppointmentService;
}
