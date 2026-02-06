/**
 * @fileoverview Admin Patients Page Controller
 * Manages the patient appointment list view for hospital administrators
 * Displays all appointments, allows viewing details, updating status, and uploading documents
 * 
 * @module pages/admin/AdminPatients
 * @author SwasthyaSetu Team
 * @version 2.0.0 (Refactored for modularity)
 * 
 * @requires services/AuthService
 * @requires services/AppointmentService
 * @requires utils/Helpers
 * @requires utils/Formatters
 * @requires components/modal/PatientDetailsModal
 */

/**
 * Admin Patients Page Module
 * Singleton pattern for managing patient appointments view
 */
const AdminPatients = {
    /**
     * Internal state object
     * @private
     */
    state: {
        /** @type {Array} All loaded appointments */
        appointments: [],

        /** @type {Object|null} Currently selected appointment */
        currentAppointment: null,

        /** @type {boolean} Loading state */
        isLoading: false,

        /** @type {string|null} Current filter */
        filter: null
    },

    /**
     * Patient Details Modal instance
     * @private
     * @type {PatientDetailsModal|null}
     */
    modal: null,

    /**
     * Initialize the admin patients page
     * Sets up modal, event listeners, and loads initial data
     * 
     * @public
     * @returns {Promise<void>}
     * @example
     * await AdminPatients.init();
     */
    async init() {
        console.log('[AdminPatients] Initializing...');

        try {
            // 1. Create modal instance
            this.createModal();

            // 2. Setup event listeners
            this.setupEventListeners();

            // 3. Load appointments
            await this.loadAppointments();

            console.log('[AdminPatients] Initialization complete');
        } catch (error) {
            console.error('[AdminPatients] Initialization error:', error);
            Helpers.showToast('Failed to initialize page', 'error');
        }
    },

    /**
     * Create and configure the patient details modal
     * 
     * @private
     */
    createModal() {
        if (!this.modal) {
            this.modal = new PatientDetailsModal();

            // Set modal callbacks
            this.modal.onStatusUpdate = (appointmentId, newStatus) => {
                this.handleStatusUpdated(appointmentId, newStatus);
            };

            this.modal.onDocumentUpload = (appointmentId) => {
                this.handleDocumentUploaded(appointmentId);
            };

            console.log('[AdminPatients] Modal created');
        }
    },

    /**
     * Setup page event listeners
     * Configures filters, search, and other interactive elements
     * 
     * @private
     */
    setupEventListeners() {
        // Add Patient button
        const addBtn = document.getElementById('add-patient-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.handleAddPatient());
        }

        // Filter buttons (status filters)
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.applyFilter(filter);
            });
        });

        // Search input (if exists)
        const searchInput = document.getElementById('patient-search');
        if (searchInput) {
            searchInput.addEventListener('input', Helpers.debounce((e) => {
                this.handleSearch(e.target.value);
            }, UI_CONFIG.SEARCH_DEBOUNCE_DELAY));
        }

        console.log('[AdminPatients] Event listeners setup complete');
    },

    /**
     * Load appointments from AppointmentService
     * Handles both API and local storage fallback
     * 
     * @private
     * @returns {Promise<void>}
     */
    async loadAppointments() {
        this.setState({ isLoading: true });
        this.showLoadingState();

        try {
            console.log('[AdminPatients] Fetching appointments...');

            // Fetch from AppointmentService
            const appointments = await AppointmentService.fetchAppointments();

            // Update state
            this.setState({
                appointments: appointments,
                isLoading: false
            });

            // Render table
            this.renderTable();

            // Update statistics
            this.updateStatistics();

            console.log(`[AdminPatients] Loaded ${appointments.length} appointments`);

        } catch (error) {
            console.error('[AdminPatients] Error loading appointments:', error);
            this.setState({ isLoading: false });
            this.showErrorState();
            Helpers.showToast('Failed to load appointments', 'error');
        }
    },

    /**
     * Update state and trigger UI updates
     * 
     * @private
     * @param {Object} updates - State updates
     */
    setState(updates) {
        this.state = { ...this.state, ...updates };
        // Note: We don't auto-render on every state change
        // Call render methods explicitly where needed
    },

    /**
     * Render appointments table
     * Generates table HTML with all appointment rows
     * 
     * @private
     */
    renderTable() {
        const tableBody = document.getElementById('patients-table-body');
        if (!tableBody) {
            console.warn('[AdminPatients] Table body element not found');
            return;
        }

        const appointments = this.getFilteredAppointments();

        if (appointments.length === 0) {
            tableBody.innerHTML = this.getEmptyStateHTML();
            return;
        }

        // Generate table rows
        const rows = appointments.map(apt => this.generateTableRow(apt)).join('');
        tableBody.innerHTML = rows;

        // Attach row click handlers
        this.attachRowClickHandlers();

        console.log(`[AdminPatients] Rendered ${appointments.length} rows`);
    },

    /**
     * Generate HTML for a single table row
     * 
     * @private
     * @param {Object} appointment - Appointment object
     * @returns {string} HTML string for table row
     */
    generateTableRow(appointment) {
        const user = appointment.userId || {};
        const statusColorClass = Formatters.getStatusColor(appointment.status);

        return `
            <tr class="appointment-row border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                data-appointment-id="${appointment._id}"
                role="button"
                tabindex="0"
                aria-label="View details for ${appointment.patientName || user.name}">
                
                <!-- Patient ID -->
                <td class="px-6 py-4">
                    <span class="font-mono text-sm text-gray-600">${appointment._id}</span>
                </td>
                
                <!-- Patient Name -->
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                            ${this.getInitials(appointment.patientName || user.name)}
                        </div>
                        <div>
                            <p class="font-semibold text-gray-900">
                                ${Formatters.formatPatientName(appointment.patientName || user.name, user.gender)}
                            </p>
                            <p class="text-xs text-gray-500">${Formatters.formatABHA(appointment.abhaId || 'N/A')}</p>
                        </div>
                    </div>
                </td>
                
                <!-- Age -->
                <td class="px-6 py-4">
                    <span class="text-gray-700">${user.age || 'N/A'}</span>
                </td>
                
                <!-- Department -->
                <td class="px-6 py-4">
                    <span class="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                        ${appointment.specialty || appointment.department || 'General'}
                    </span>
                </td>
                
                <!-- Appointment Date -->
                <td class="px-6 py-4">
                    <div class="flex flex-col">
                        <span class="font-medium text-gray-900">${Formatters.formatDate(appointment.date, 'short')}</span>
                        <span class="text-xs text-gray-500">${Formatters.formatDate(appointment.date, 'time')}</span>
                    </div>
                </td>
                
                <!-- Status -->
                <td class="px-6 py-4">
                    ${Formatters.formatStatusBadge(appointment.status)}
                </td>
                
                <!-- Actions -->
                <td class="px-6 py-4">
                    <button class="view-details-btn inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                            data-appointment-id="${appointment._id}"
                            aria-label="View details">
                        <span class="material-icons-outlined text-sm">visibility</span>
                        View
                    </button>
                </td>
            </tr>
        `;
    },

    /**
     * Get initials from name for avatar
     * 
     * @private
     * @param {string} name - Full name
     * @returns {string} Initials (e.g., "JD" for "John Doe")
     */
    getInitials(name) {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    },

    /**
     * Get empty state HTML when no appointments found
     * 
     * @private
     * @returns {string} HTML string for empty state
     */
    getEmptyStateHTML() {
        return `
            <tr>
                <td colspan="7" class="px-6 py-12">
                    <div class="text-center">
                        <span class="material-icons-outlined text-6xl text-gray-300 mb-4">inbox</span>
                        <p class="text-gray-500 text-lg font-medium">No appointments found</p>
                        <p class="text-gray-400 text-sm mt-1">
                            ${this.state.filter ? 'Try changing the filter' : 'Appointments will appear here when patients book'}
                        </p>
                    </div>
                </td>
            </tr>
        `;
    },

    /**
     * Show loading state in table
     * 
     * @private
     */
    showLoadingState() {
        const tableBody = document.getElementById('patients-table-body');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center">
                        <span class="material-icons-outlined text-4xl text-blue-500 animate-spin mb-3">refresh</span>
                        <p class="text-gray-600 font-medium">Loading appointments...</p>
                    </td>
                </tr>
            `;
        }
    },

    /**
     * Show error state in table
     * 
     * @private
     */
    showErrorState() {
        const tableBody = document.getElementById('patients-table-body');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center">
                        <span class="material-icons-outlined text-4xl text-red-500 mb-3">error_outline</span>
                        <p class="text-gray-600 font-medium">Failed to load appointments</p>
                        <button onclick="AdminPatients.loadAppointments()" 
                                class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                            Retry
                        </button>
                    </td>
                </tr>
            `;
        }
    },

    /**
     * Attach click handlers to table rows
     * 
     * @private
     */
    attachRowClickHandlers() {
        document.querySelectorAll('.appointment-row').forEach(row => {
            row.addEventListener('click', (e) => {
                // Don't trigger if clicking on action button
                if (e.target.closest('.view-details-btn')) return;

                const appointmentId = row.dataset.appointmentId;
                this.openDetailsModal(appointmentId);
            });

            // Keyboard support
            row.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const appointmentId = row.dataset.appointmentId;
                    this.openDetailsModal(appointmentId);
                }
            });
        });

        // View details button handlers
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const appointmentId = btn.dataset.appointmentId;
                this.openDetailsModal(appointmentId);
            });
        });
    },

    /**
     * Open patient details modal
     * 
     * @public
     * @param {string} appointmentId - Appointment ID to display
     */
    openDetailsModal(appointmentId) {
        const appointment = this.state.appointments.find(a => a._id === appointmentId);

        if (!appointment) {
            console.error('[AdminPatients] Appointment not found:', appointmentId);
            Helpers.showToast('Appointment not found', 'error');
            return;
        }

        // Set current appointment
        this.setState({ currentAppointment: appointment });

        // Update modal and open
        if (this.modal) {
            this.modal.setPatientData(appointment);
            this.modal.open();
        }

        console.log('[AdminPatients] Opened details modal for:', appointmentId);
    },

    /**
     * Handle status update from modal
     * 
     * @private
     * @param {string} appointmentId - Appointment ID
     * @param {string} newStatus - New status value
     */
    handleStatusUpdated(appointmentId, newStatus) {
        // Update local state
        const appointment = this.state.appointments.find(a => a._id === appointmentId);
        if (appointment) {
            appointment.status = newStatus;
            this.renderTable();
            this.updateStatistics();
        }

        console.log('[AdminPatients] Status updated:', appointmentId, newStatus);
    },

    /**
     * Handle document upload from modal
     * 
     * @private
     * @param {string} appointmentId - Appointment ID
     */
    handleDocumentUploaded(appointmentId) {
        // Could refresh the appointment data here
        console.log('[AdminPatients] Document uploaded for:', appointmentId);
    },

    /**
     * Update statistics display
     * Shows counts for different appointment statuses
     * 
     * @private
     */
    updateStatistics() {
        const stats = {
            total: this.state.appointments.length,
            pending: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0
        };

        // Count by status
        this.state.appointments.forEach(apt => {
            stats[apt.status] = (stats[apt.status] || 0) + 1;
        });

        // Update DOM if stat elements exist
        this.updateStatElement('total-patients', stats.total);
        this.updateStatElement('pending-patients', stats.pending);
        this.updateStatElement('confirmed-patients', stats.confirmed);
        this.updateStatElement('completed-patients', stats.completed);

        console.log('[AdminPatients] Statistics updated:', stats);
    },

    /**
     * Update a single stat element
     * 
     * @private
     * @param {string} elementId - Element ID
     * @param {number} value - Stat value
     */
    updateStatElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    },

    /**
     * Apply filter to appointments list
     * 
     * @private
     * @param {string|null} filter - Filter value ('all', 'pending', 'confirmed', etc.)
     */
    applyFilter(filter) {
        this.setState({ filter: filter === 'all' ? null : filter });
        this.renderTable();
        console.log('[AdminPatients] Filter applied:', filter);
    },

    /**
     * Get filtered appointments based on current filter
     * 
     * @private
     * @returns {Array} Filtered appointments
     */
    getFilteredAppointments() {
        if (!this.state.filter) {
            return this.state.appointments;
        }

        return this.state.appointments.filter(apt =>
            apt.status === this.state.filter
        );
    },

    /**
     * Handle search input
     * Filters appointments by patient name or ID
     * 
     * @private
     * @param {string} query - Search query
     */
    handleSearch(query) {
        if (!query || query.trim() === '') {
            this.setState({ filter: null });
            this.renderTable();
            return;
        }

        const lowerQuery = query.toLowerCase();
        const filtered = this.state.appointments.filter(apt => {
            const name = (apt.patientName || apt.userId?.name || '').toLowerCase();
            const id = apt._id.toLowerCase();
            const abha = (apt.abhaId || '').toLowerCase();

            return name.includes(lowerQuery) ||
                id.includes(lowerQuery) ||
                abha.includes(lowerQuery);
        });

        // Temporarily update appointments to show filtered
        const originalAppointments = this.state.appointments;
        this.state.appointments = filtered;
        this.renderTable();
        this.state.appointments = originalAppointments;
    },

    /**
     * Handle add patient button click
     * 
     * @private
     */
    handleAddPatient() {
        // This would open a form to manually add patient
        Helpers.showToast('Add patient feature coming soon', 'info');
    },

    /**
     * Refresh appointments from server
     * 
     * @public
     * @returns {Promise<void>}
     */
    async refresh() {
        await this.loadAppointments();
        Helpers.showToast('Appointments refreshed', 'success');
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[AdminPatients] DOM ready, initializing...');
    AdminPatients.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminPatients;
}
