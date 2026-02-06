/**
 * @fileoverview Patient Details Modal Component
 * Specialized modal for displaying and managing patient appointment details
 * Extends BaseModal with patient-specific functionality
 * @module components/modal/PatientDetailsModal
 * @author SwasthyaSetu Team
 * @version 1.0.0
 */

/**
 * Patient Details Modal Class
 * Displays comprehensive patient information, documents, and action buttons
 * 
 * @extends BaseModal
 * @class
 * @example
 * const modal = new PatientDetailsModal();
 * modal.setPatientData(appointmentObject);
 * modal.open();
 */
class PatientDetailsModal extends BaseModal {
    /**
     * Create a Patient Details Modal instance
     */
    constructor() {
        super('patient-details-modal', 'Patient Details', {
            closeOnOverlayClick: true,
            closeOnEscape: true,
            size: 'xl'
        });

        /** @private */
        this.currentPatient = null;

        /**
         * Callback function when status is updated
         * @type {Function|null}
         */
        this.onStatusUpdate = null;

        /**
         * Callback function when document is uploaded
         * @type {Function|null}
         */
        this.onDocumentUpload = null;

        // Initialize upload input
        this.createFileInput();
        this.setupDocumentUploadHandlers();
    }

    /**
     * Create hidden file input for document uploads
     * 
     * @private
     */
    createFileInput() {
        // Check if already exists
        if (document.getElementById('modal-file-input')) return;

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'modal-file-input';
        fileInput.accept = FILE_UPLOAD_CONFIG.ALLOWED_DOCUMENT_EXTENSIONS.join(',');
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        this.fileInput = fileInput;
    }

    /**
     * Setup document upload event handlers
     * 
     * @private
     */
    setupDocumentUploadHandlers() {
        if (!this.fileInput) return;

        this.fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file || !this.currentPatient) return;

            try {
                // Show loading state
                Helpers.showToast('Uploading document...', 'info');

                // Upload document
                await AppointmentService.uploadDocument(
                    this.currentPatient._id,
                    file,
                    this.fileInput.dataset.documentType || DOCUMENT_TYPES.OTHER
                );

                Helpers.showToast(SUCCESS_MESSAGES.DOCUMENT_UPLOADED, 'success');

                // Call callback
                if (typeof this.onDocumentUpload === 'function') {
                    this.onDocumentUpload(this.currentPatient._id);
                }

                // Refresh patient data
                await this.refreshPatientData();

            } catch (error) {
                console.error('[PatientDetailsModal] Upload error:', error);
                Helpers.showToast(ERROR_MESSAGES.FILE_UPLOAD_ERROR, 'error');
            }

            // Reset file input
            this.fileInput.value = '';
        });
    }

    /**
     * Set patient data and render modal content
     * 
     * @param {Object} patientData - Appointment/patient object
     * @public
     * @example
     * modal.setPatientData({
     *   _id: 'APT-001',
     *   patientName: 'John Doe',
     *   date: '2026-02-15',
     *   status: 'pending'
     * });
     */
    setPatientData(patientData) {
        if (!patientData) {
            console.error('[PatientDetailsModal] No patient data provided');
            return;
        }

        this.currentPatient = patientData;
        this.render();
    }

    /**
     * Render modal content with patient data
     * 
     * @private
     */
    render() {
        if (!this.currentPatient) return;

        const patient = this.currentPatient;
        const user = patient.userId || {};

        // Build body content
        const bodyHTML = `
            <div class="space-y-6">
                <!-- Patient Information Card -->
                <div class="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                    <h4 class="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                        <span class="material-icons-outlined text-blue-600">person</span>
                        Patient Information
                    </h4>
                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <p class="text-sm text-gray-600">Patient Name</p>
                            <p class="font-semibold text-gray-900">${Formatters.formatPatientName(patient.patientName || user.name, user.gender)}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">ABHA ID</p>
                            <p class="font-mono text-sm font-semibold text-gray-900">${Formatters.formatABHA(patient.abhaId || 'N/A')}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Age / Gender</p>
                            <p class="font-semibold text-gray-900">${user.age || 'N/A'} / ${Formatters.capitalizeWords(user.gender || 'N/A')}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Mobile</p>
                            <p class="font-semibold text-gray-900">${Formatters.formatMobile(user.mobile || 'N/A', true)}</p>
                        </div>
                    </div>
                </div>

                <!-- Appointment Details Card -->
                <div class="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-6">
                    <h4 class="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                        <span class="material-icons-outlined text-purple-600">event</span>
                        Appointment Details
                    </h4>
                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <p class="text-sm text-gray-600">Date & Time</p>
                            <p class="font-semibold text-gray-900">${Formatters.formatDate(patient.date, 'datetime')}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Department</p>
                            <p class="font-semibold text-gray-900">${patient.specialty || patient.department || 'N/A'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Status</p>
                            <div>${Formatters.formatStatusBadge(patient.status)}</div>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Appointment ID</p>
                            <p class="font-mono text-sm font-semibold text-gray-900">${patient._id}</p>
                        </div>
                    </div>
                    ${patient.reason ? `
                        <div class="mt-4">
                            <p class="text-sm text-gray-600">Reason for Visit</p>
                            <p class="font-semibold text-gray-900">${patient.reason}</p>
                        </div>
                    ` : ''}
                    ${patient.description ? `
                        <div class="mt-4">
                            <p class="text-sm text-gray-600">Additional Notes</p>
                            <p class="text-gray-700">${patient.description}</p>
                        </div>
                    ` : ''}
                </div>

                <!-- Documents Section -->
                <div class="rounded-xl border-2 border-dashed border-gray-300 p-6">
                    <h4 class="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                        <span class="material-icons-outlined text-green-600">description</span>
                        Medical Documents
                    </h4>
                    
                    <!-- Upload Buttons -->
                    <div class="mb-4 flex flex-wrap gap-3">
                        <button type="button" 
                                class="upload-btn inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                                data-type="${DOCUMENT_TYPES.PRESCRIPTION}">
                            <span class="material-icons-outlined text-sm">upload_file</span>
                            Upload Prescription
                        </button>
                        <button type="button" 
                                class="upload-btn inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                                data-type="${DOCUMENT_TYPES.REPORT}">
                            <span class="material-icons-outlined text-sm">lab_research</span>
                            Upload Medical Report
                        </button>
                        <button type="button" 
                                class="upload-btn inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                                data-type="${DOCUMENT_TYPES.XRAY}">
                            <span class="material-icons-outlined text-sm">medical_services</span>
                            Upload X-ray/MRI
                        </button>
                    </div>

                    <!-- Documents List -->
                    <div class="documents-list">
                        ${this.renderDocumentsList(patient.documents)}
                    </div>
                </div>
            </div>
        `;

        // Build footer with status action buttons
        const footerHTML = `
            <div class="flex flex-wrap gap-3">
                <button type="button" 
                        class="status-update-btn inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                        data-status="${APPOINTMENT_STATUS.CONFIRMED}">
                    <span class="material-icons-outlined text-sm">event_available</span>
                    Confirm Appointment
                </button>
                <button type="button" 
                        class="status-update-btn inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                        data-status="${APPOINTMENT_STATUS.CANCELLED}">
                    <span class="material-icons-outlined text-sm">cancel</span>
                    Cancel Appointment
                </button>
                <button type="button" 
                        class="status-update-btn inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                        data-status="${APPOINTMENT_STATUS.COMPLETED}">
                    <span class="material-icons-outlined text-sm">check_circle</span>
                    Mark as Completed
                </button>
            </div>
        `;

        // Set modal content
        this.setBody(bodyHTML);
        this.setFooter(footerHTML);

        // Attach event listeners
        this.attachModalEventListeners();
    }

    /**
     * Render documents list HTML
     * 
     * @param {Array} documents - Array of document objects
     * @returns {string} HTML string
     * @private
     */
    renderDocumentsList(documents) {
        if (!documents || documents.length === 0) {
            return `
                <div class="text-center py-8 text-gray-500">
                    <span class="material-icons-outlined text-4xl mb-2 opacity-50">folder_open</span>
                    <p>No documents uploaded yet</p>
                </div>
            `;
        }

        return `
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                ${documents.map(doc => `
                    <div class="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
                        <span class="material-icons-outlined text-blue-600">description</span>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-gray-900 truncate">${doc.name}</p>
                            <p class="text-xs text-gray-500">
                                ${Formatters.formatFileSize(doc.size)} • ${Formatters.formatDate(doc.uploadedAt, 'relative')}
                            </p>
                        </div>
                        <span class="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            ${Formatters.capitalizeWords(doc.type)}
                        </span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Attach event listeners to modal buttons
     * 
     * @private
     */
    attachModalEventListeners() {
        const bodyElement = this.getBodyElement();
        const footerElement = this.getFooterElement();

        if (!bodyElement || !footerElement) return;

        // Upload button handlers
        bodyElement.querySelectorAll('.upload-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const documentType = btn.dataset.type;
                this.triggerFileUpload(documentType);
            });
        });

        // Status update button handlers
        footerElement.querySelectorAll('.status-update-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const newStatus = btn.dataset.status;
                await this.handleStatusUpdate(newStatus);
            });
        });
    }

    /**
     * Trigger file upload dialog
     * 
     * @param {string} documentType - Type of document to upload
     * @private
     */
    triggerFileUpload(documentType) {
        if (!this.fileInput) return;

        this.fileInput.dataset.documentType = documentType;
        this.fileInput.click();
    }

    /**
     * Handle status update button click
     * 
     * @param {string} newStatus - New status value
     * @private
     */
    async handleStatusUpdate(newStatus) {
        if (!this.currentPatient) return;

        try {
            // Show loading state
            Helpers.showToast(`Updating status to ${newStatus}...`, 'info');

            // Update status via service
            await AppointmentService.updateStatus(this.currentPatient._id, newStatus);

            // Show success
            Helpers.showToast(SUCCESS_MESSAGES.APPOINTMENT_UPDATED, 'success');

            // Update current patient data
            this.currentPatient.status = newStatus;

            // Re-render to show updated status
            this.render();

            // Call callback
            if (typeof this.onStatusUpdate === 'function') {
                this.onStatusUpdate(this.currentPatient._id, newStatus);
            }

        } catch (error) {
            console.error('[PatientDetailsModal] Status update error:', error);
            Helpers.showToast('Failed to update status', 'error');
        }
    }

    /**
     * Refresh patient data from service
     * 
     * @private
     */
    async refreshPatientData() {
        if (!this.currentPatient) return;

        try {
            const updated = AppointmentService.getAppointmentById(this.currentPatient._id);
            if (updated) {
                this.currentPatient = updated;
                this.render();
            }
        } catch (error) {
            console.error('[PatientDetailsModal] Error refreshing data:', error);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PatientDetailsModal;
}
