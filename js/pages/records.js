/**
 * Medical Records Page Script
 * Handles fetching and displaying patient's medical history and documents.
 */

const Records = {
    state: {
        appointments: []
    },

    async init() {
        console.log('Initializing Records...');

        // 1. Check Auth
        if (!AuthService.isAuthenticated()) {
            window.location.href = '../index.html';
            return;
        }

        // 2. Load Data
        await this.loadRecords();

        // 3. Setup UI
        this.setupEventListeners();
    },

    async loadRecords() {
        try {
            // Use existing API service which hits /api/appointments
            const response = await APIService.getAppointments();

            if (response.success) {
                this.state.appointments = response.data || [];
                this.renderTimeline(this.state.appointments);
                this.updateStats(this.state.appointments);
            } else {
                Helpers.showToast('Failed to load medical records', 'error');
            }
        } catch (error) {
            console.error('Error loading records:', error);
            document.getElementById('timeline-container').innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p>Unable to load records. Please try again later.</p>
                </div>
            `;
        }
    },

    /**
     * Renders the timeline of appointments and documents
     */
    renderTimeline(appointments) {
        const container = document.getElementById('timeline-container');
        if (!container) return;

        container.innerHTML = '';

        if (appointments.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <span class="material-icons-outlined text-4xl text-gray-400 mb-2">folder_off</span>
                    <p class="text-gray-500 dark:text-gray-400">No medical records found.</p>
                    <a href="book-appointment.html" class="inline-block mt-4 text-primary hover:underline font-medium">Book your first appointment</a>
                </div>
            `;
            return;
        }

        // Sort by date descending (should be already, but ensure)
        const sorted = [...appointments].sort((a, b) => new Date(b.date) - new Date(a.date));

        sorted.forEach(app => {
            // Render Appointment Card
            // If completed or confirmed, show it.
            if (['completed', 'confirmed', 'pending'].includes(app.status)) {

                // 1. Main Appointment Card
                const appCard = this.createAppointmentCard(app);
                container.appendChild(appCard);

                // 2. Render Attached Documents (if any)
                if (app.documents && app.documents.length > 0) {
                    app.documents.forEach(doc => {
                        const docCard = this.createDocumentCard(doc, app);
                        container.appendChild(docCard);
                    });
                }
            }
        });
    },

    createAppointmentCard(app) {
        const date = new Date(app.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        const time = app.time;

        const div = document.createElement('div');
        div.className = 'bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border-l-4 border-primary mb-6 transition-all hover:shadow-xl';

        // Status badge
        const statusColors = {
            'completed': 'bg-green-100 text-green-800',
            'confirmed': 'bg-blue-100 text-blue-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        const badge = `<span class="px-2 py-0.5 rounded text-xs font-bold uppercase ${statusColors[app.status] || 'bg-gray-100 text-gray-800'}">${app.status}</span>`;

        div.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span class="material-icons-outlined text-secondary">assignment</span>
                    </div>
                    <div>
                        <h3 class="font-bold text-lg text-secondary dark:text-white">
                            ${app.reason || 'General Checkup'}
                        </h3>
                        <p class="text-gray-600 dark:text-gray-300">${app.doctor} • ${app.hospital?.name || app.hospital || 'Hospital'}</p>
                        <p class="text-sm text-gray-500">${date} • ${time} • ${badge}</p>
                    </div>
                </div>
            </div>

            ${app.notes ? `
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-2">
                <p class="text-sm text-gray-700 dark:text-gray-300"><strong>Notes:</strong> ${app.notes}</p>
            </div>
            ` : ''}
        `;
        return div;
    },

    createDocumentCard(doc, app) {
        const div = document.createElement('div');
        // Different colors based on doc type
        let borderClass = 'border-gray-500';
        let icon = 'description';
        let bgIcon = 'bg-gray-500';

        switch (doc.type) {
            case 'prescription':
                borderClass = 'border-purple-500';
                bgIcon = 'bg-purple-500';
                icon = 'medication';
                break;
            case 'report':
            case 'diagnosis':
                borderClass = 'border-blue-500';
                bgIcon = 'bg-blue-500';
                icon = 'science';
                break;
            case 'other':
                borderClass = 'border-orange-500';
                bgIcon = 'bg-orange-500';
                icon = 'folder';
                break;
        }

        // Handle URL
        // If relative path from backend (starts with /uploads), prepend API URL
        // BUT wait, if we are in frontend, the API URL might be different.
        // We need a helper to resolve the full URL.
        const fullUrl = this.resolveFileUrl(doc.url);

        div.className = `bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border-l-4 ${borderClass} mb-6 ml-8 md:ml-12 relative`;

        // Connector line visual (styled via CSS or inline for now)
        // div.style.marginTop = '-1rem'; // overlap slightly

        div.innerHTML = `
            <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 ${bgIcon} rounded-full flex items-center justify-center flex-shrink-0">
                        <span class="material-icons-outlined text-white text-lg">${icon}</span>
                    </div>
                    <div>
                        <h3 class="font-bold text-base text-secondary dark:text-white capitalize">${doc.type}</h3>
                        <p class="text-sm text-gray-500">Uploaded on ${new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <a href="${fullUrl}" target="_blank" download
                    class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-1">
                    <span class="material-icons-outlined text-sm">download</span> Download
                </a>
            </div>
            ${doc.notes ? `<p class="text-xs text-gray-500 mt-1 italic pl-14">"${doc.notes}"</p>` : ''}
        `;
        return div;
    },

    resolveFileUrl(path) {
        if (!path) return '#';
        if (path.startsWith('http')) return path;

        // Use the same logic as APIService to find base URL
        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
        // Remove '/api' from the base URL for static file access
        const productionBase = API_CONFIG.PRODUCTION_API_URL.replace('/api', '');
        const apiBaseUrl = isLocal
            ? 'http://localhost:5000' // No /api for static files usually if mapped at root or /uploads
            : productionBase;

        // Our server.js maps /uploads -> /uploads
        // So http://localhost:5000/uploads/reports/file.pdf
        return `${apiBaseUrl}${path}`;
    },

    updateStats(appointments) {
        const total = appointments.length;
        // Count documents
        let prescriptions = 0;
        let reports = 0;

        appointments.forEach(app => {
            if (app.documents) {
                app.documents.forEach(doc => {
                    if (doc.type === 'prescription') prescriptions++;
                    if (doc.type === 'report' || doc.type === 'diagnosis') reports++;
                });
            }
        });

        // Update DOM
        const statEls = document.querySelectorAll('.text-2xl.font-bold.text-secondary');
        if (statEls.length >= 3) {
            statEls[0].textContent = total;
            statEls[1].textContent = prescriptions;
            statEls[2].textContent = reports;
        }

        // Update User Profile Info if available in auth
        const user = AuthService.getCurrentUser();
        if (user) {
            const nameEl = document.querySelector('h2.font-display.text-2xl');
            if (nameEl) nameEl.textContent = user.name || 'Patient';

            const infoEl = document.querySelector('p.text-gray-700'); // ABHA ID
            if (infoEl) infoEl.textContent = `ABHA ID: ${user.abhaId || user.identifier || 'N/A'}`;
        }
    },

    setupEventListeners() {
        // Filter buttons (Future implementation)
        const buttons = document.querySelectorAll('button.bg-gray-300');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                Helpers.showToast('Filter feature coming soon', 'info');
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Records.init();
});
