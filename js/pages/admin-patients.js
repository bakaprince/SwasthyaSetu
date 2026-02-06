/**
 * Admin Patients Page Script
 * Handles fetching patient data, displaying the list, and managing the details modal.
 */

const AdminPatients = {
    state: {
        appointments: [],
        currentAppointment: null
    },

    async init() {
        console.log('Initializing Admin Patients...');

        // 1. Create Modal HTML if needed
        if (!document.getElementById('patient-modal')) {
            console.log('Creating modal...');
            this.createModalHTML();
        }

        // 2. Setup Event Listeners
        this.setupEventListeners();

        // 3. Fetch Appointments (Patients)
        await this.fetchPatients();
    },

    async fetchPatients() {
        try {
            // Need a valid token AND admin role
            const token = AuthService.currentUser?.token;
            const userType = AuthService.currentUser?.type;

            // If no token OR not an admin, use local data
            if (!token || userType !== 'admin') {
                console.warn('No admin token found, rendering local data...');
                this.renderDemoData();
                return;
            }

            // Detect API URL based on environment (copied from auth.js logic)
            const hostname = window.location.hostname;
            const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
            const apiBaseUrl = isLocal
                ? 'http://localhost:5000/api'
                : 'https://swasthyasetu-9y5l.onrender.com/api';

            // Fetch 'pending' or 'confirmed' appointments mostly
            // We want all for the list, maybe filter by status later
            const response = await fetch(`${apiBaseUrl}/appointments/hospital`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.state.appointments = data.data;
                this.renderTable(data.data);
                this.updateStats(data.data);
            } else {
                Helpers.showToast('Failed to load patients', 'error');
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
            // Fallback for demo if API fails
            this.renderDemoData();
        }
    },

    renderTable(appointments) {
        const tbody = document.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (appointments.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">No patients found</td></tr>`;
            return;
        }

        appointments.forEach(app => {
            const user = app.userId || {}; // Populated user object
            // Map demo 'reason' to 'condition' if needed, or just use reason.
            const statusColor = this.getStatusColor(app.status);

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors';
            // Store ID on the row or button
            tr.innerHTML = `
                <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">${app.abhaId || app._id.substring(app._id.length - 8).toUpperCase()}</td>
                <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <div class="font-medium">${user.name || 'Unknown'}</div>
                    <div class="text-xs text-gray-500">${user.mobile || ''}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">${user.age || 'N/A'}</td>
                <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">${app.specialty || 'General'}</td>
                <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">${new Date(app.date).toLocaleDateString()}</td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 ${statusColor} rounded-full text-xs font-semibold capitalize">${app.status}</span>
                </td>
                <td class="px-6 py-4">
                    <button class="view-btn text-primary hover:text-green-400 text-sm font-medium" data-id="${app._id}">
                        View Details
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    getStatusColor(status) {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
            case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    },

    updateStats(appointments) {
        // Simple client-side stats
        const total = appointments.length;
        const newAdmissions = appointments.filter(a => {
            const date = new Date(a.createdAt || a.date); // Use whatever date exists
            const now = new Date();
            return (now - date) < (7 * 24 * 60 * 60 * 1000); // Last 7 days
        }).length;
        const active = appointments.filter(a => ['confirmed', 'pending'].includes(a.status)).length;
        const discharged = appointments.filter(a => a.status === 'completed').length;

        // Update DOM if elements exist
        const statEls = document.querySelectorAll('.text-3xl.font-bold');
        if (statEls.length >= 4) {
            statEls[0].textContent = total;
            statEls[1].textContent = newAdmissions;
            statEls[2].textContent = active;
            statEls[3].textContent = discharged;
        }
    },

    openPatientModal(id) {
        const appointment = this.state.appointments.find(a => a._id === id);
        if (!appointment) return;

        this.state.currentAppointment = appointment;
        const user = appointment.userId || {};

        let modal = document.getElementById('patient-modal');
        if (!modal) {
            this.createModalHTML();
            modal = document.getElementById('patient-modal');
        }

        // Fill Data
        document.getElementById('modal-patient-name').textContent = user.name || 'Unknown';
        document.getElementById('modal-patient-id').textContent = `ID: ${appointment._id}`;
        document.getElementById('modal-patient-age').textContent = `${user.age || 'N/A'} yrs, ${user.gender || 'N/A'}`;
        document.getElementById('modal-patient-mobile').textContent = user.mobile || 'N/A';
        document.getElementById('modal-appointment-date').textContent = new Date(appointment.date).toLocaleDateString();
        // Use 'condition' if available, else 'reason'
        document.getElementById('modal-condition').textContent = appointment.condition || appointment.reason || 'N/A';
        document.getElementById('modal-description').textContent = appointment.description || 'No additional description provided.';

        // Populate existing documents
        const docsList = document.getElementById('modal-docs-list');
        docsList.innerHTML = '';
        if (appointment.documents && appointment.documents.length > 0) {
            appointment.documents.forEach(doc => {
                const li = document.createElement('li');
                li.className = 'flex items-center justify-between text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600';
                li.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <span class="material-icons-outlined text-lg">description</span>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 dark:text-white capitalize">${doc.type}</p>
                            <p class="text-xs text-gray-500">${new Date(doc.uploadedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <a href="${doc.url}" target="_blank" class="text-primary hover:text-green-400 text-sm font-medium hover:underline">View</a>
                `;
                docsList.appendChild(li);
            });
        } else {
            docsList.innerHTML = '<li class="text-gray-500 text-sm italic text-center py-4">No documents uploaded yet</li>';
        }

        // Show Modal
        modal.classList.remove('hidden');
    },

    closeModal() {
        const modal = document.getElementById('patient-modal');
        if (modal) modal.classList.add('hidden');
    },

    createModalHTML() {
        const modal = document.createElement('div');
        modal.id = 'patient-modal';
        modal.className = 'fixed inset-0 z-[60] overflow-y-auto hidden'; // High z-index
        modal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div class="absolute inset-0 bg-gray-900 opacity-75 backdrop-blur-sm"></div>
                </div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    
                    <div class="bg-white dark:bg-gray-800 px-6 pt-6 pb-4">
                        <div class="flex items-start justify-between mb-6">
                            <div>
                                <h3 class="text-2xl font-bold text-gray-900 dark:text-white font-display" id="modal-patient-name">Patient Name</h3>
                                <p class="text-sm text-primary font-medium mt-1" id="modal-patient-id">ID: 12345</p>
                            </div>
                            <button id="close-modal-x" class="text-gray-400 hover:text-gray-500 transition-colors">
                                <span class="material-icons-outlined text-2xl">close</span>
                            </button>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-6 mb-8">
                            <div class="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Age & Gender</label>
                                <p class="text-base font-semibold text-gray-900 dark:text-white" id="modal-patient-age">--</p>
                            </div>
                            <div class="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Contact</label>
                                <p class="text-base font-semibold text-gray-900 dark:text-white" id="modal-patient-mobile">--</p>
                            </div>
                            <div class="col-span-2 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Condition</label>
                                <p class="text-base font-semibold text-gray-900 dark:text-white" id="modal-condition">--</p>
                            </div>
                            <div class="col-span-2 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                                <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed" id="modal-description">--</p>
                            </div>
                        </div>

                        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <span class="material-icons-outlined text-primary">folder_open</span>
                                Medical Documents
                            </h4>
                            <ul class="space-y-3 mb-6 max-h-48 overflow-y-auto pr-2" id="modal-docs-list"></ul>
                            
                            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">Quick Actions</h4>
                            <div class="grid grid-cols-2 gap-4">
                                <button id="btn-upload-prescription" class="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all border border-blue-200 dark:border-blue-800">
                                    <span class="material-icons-outlined">medication</span>
                                    Upload Prescription
                                </button>
                                <button id="btn-upload-report" class="flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all border border-purple-200 dark:border-purple-800">
                                    <span class="material-icons-outlined">science</span>
                                    Upload Report
                                </button>
                            </div>
                            <!-- Hidden File Input used by both buttons -->
                            <input type="file" id="doc-file-input" class="hidden"/>
                        </div>
                    </div>

                    <div class="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">Update Appointment Status</h4>
                        <div class="grid grid-cols-3 gap-3 mb-4">
                            <button type="button" id="mark-confirmed-btn" class="inline-flex justify-center items-center gap-2 rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none transition-colors">
                                <span class="material-icons-outlined text-lg">event_available</span>
                                Confirmed
                            </button>
                            <button type="button" id="mark-rejected-btn" class="inline-flex justify-center items-center gap-2 rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-red-600 text-sm font-medium text-white hover:bg-red-700 focus:outline-none transition-colors">
                                <span class="material-icons-outlined text-lg">cancel</span>
                                Rejected
                            </button>
                            <button type="button" id="mark-completed-btn" class="inline-flex justify-center items-center gap-2 rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-green-600 text-sm font-medium text-white hover:bg-green-700 focus:outline-none transition-colors">
                                <span class="material-icons-outlined text-lg">check_circle</span>
                                Completed
                            </button>
                        </div>
                        <button type="button" id="close-modal-btn" class="w-full inline-flex justify-center items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm px-5 py-2.5 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Bind Modal Events
        const close = () => this.closeModal();
        document.getElementById('close-modal-btn').addEventListener('click', close);
        document.getElementById('close-modal-x').addEventListener('click', close);

        // Status Update Buttons
        document.getElementById('mark-confirmed-btn').addEventListener('click', async () => {
            if (this.state.currentAppointment) {
                await this.updateStatus(this.state.currentAppointment._id, 'confirmed');
                this.closeModal();
                this.fetchPatients(); // Refresh list
            }
        });

        document.getElementById('mark-rejected-btn').addEventListener('click', async () => {
            if (this.state.currentAppointment) {
                await this.updateStatus(this.state.currentAppointment._id, 'cancelled'); // Using 'cancelled' to match existing status colors
                this.closeModal();
                this.fetchPatients(); // Refresh list
            }
        });

        document.getElementById('mark-completed-btn').addEventListener('click', async () => {
            if (this.state.currentAppointment) {
                await this.updateStatus(this.state.currentAppointment._id, 'completed');
                this.closeModal();
                this.fetchPatients(); // Refresh list
            }
        });

        // File Upload Logic
        const fileInput = document.getElementById('doc-file-input');
        let currentUploadType = 'report'; // Default

        const handleUploadClick = (type) => {
            currentUploadType = type;
            fileInput.click();
        };

        document.getElementById('btn-upload-prescription').addEventListener('click', () => handleUploadClick('prescription'));
        document.getElementById('btn-upload-report').addEventListener('click', () => handleUploadClick('report'));

        fileInput.addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                // Simulate upload immediately upon selection
                Helpers.showToast(`Uploading ${currentUploadType}...`, 'info');

                setTimeout(async () => {
                    try {
                        await this.uploadDocument(this.state.currentAppointment._id, currentUploadType);
                        this.openPatientModal(this.state.currentAppointment._id);
                        Helpers.showToast(`${currentUploadType} uploaded!`, 'success');
                        fileInput.value = ''; // Reset
                    } catch (e) {
                        // Error handled
                    }
                }, 1000);
            }
        });
    },

    async updateStatus(id, status) {
        try {
            const token = AuthService.currentUser?.token;
            const userType = AuthService.currentUser?.type;

            // For local/demo mode (no token or not admin), update localStorage
            if (!token || userType !== 'admin' || id.startsWith('APT-') || id.startsWith('PT-')) {
                console.log(`Updating status locally for ${id} to ${status}`);

                // Update in state
                const appt = this.state.appointments.find(a => a._id === id);
                if (appt) {
                    appt.status = status;
                }

                // Update in localStorage
                const localAppointments = JSON.parse(localStorage.getItem('swasthya_appointments') || '[]');
                const localAppt = localAppointments.find(a => a._id === id);
                if (localAppt) {
                    localAppt.status = status;
                    localStorage.setItem('swasthya_appointments', JSON.stringify(localAppointments));
                }

                Helpers.showToast(`Appointment marked as ${status}`, 'success');
                return;
            }

            // API call for real admin users
            const apiBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:5000/api'
                : 'https://swasthyasetu-9y5l.onrender.com/api';

            await fetch(`${apiBaseUrl}/appointments/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            Helpers.showToast(`Appointment marked as ${status}`, 'success');
        } catch (error) {
            console.error(error);
            Helpers.showToast('Failed to update status', 'error');
        }
    },

    async uploadDocument(id, type) {
        try {
            const token = AuthService.currentUser?.token;

            const fileInput = document.getElementById('doc-file-input');
            const file = fileInput.files[0];

            if (!file) {
                Helpers.showToast('Please select a file to upload', 'error');
                return;
            }

            // SIMULATION: If we are effectively offline or using demo data, just update locally
            const hostname = window.location.hostname;
            const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

            // If strictly demo (no token or using demo data explicitly), skip API
            // Updated to support new manual appointments (APT-EXIST...)
            if (!token || id.startsWith('APT-') || id.startsWith('PT-')) {
                // Simulate delay
                await new Promise(r => setTimeout(r, 800));

                // Update local state
                if (this.state.currentAppointment) {
                    if (!this.state.currentAppointment.documents) {
                        this.state.currentAppointment.documents = [];
                    }
                    this.state.currentAppointment.documents.push({
                        type: type,
                        url: '#', // specific dummy url
                        uploadedAt: new Date().toISOString()
                    });
                }
                return; // Success simulation
            }

            // Actual API Call (fallback if connected)
            const apiBaseUrl = isLocal
                ? 'http://localhost:5000/api'
                : 'https://swasthyasetu-9y5l.onrender.com/api';

            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);
            formData.append('notes', 'Uploaded via Admin Dashboard');

            const response = await fetch(`${apiBaseUrl}/appointments/${id}/documents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                // If API succeeds, we usually re-fetch, but let's update local state too if needed
            } else {
                throw new Error(data.message || 'Upload failed');
            }

        } catch (error) {
            console.error(error);
            // If it's a network error or fetch failed, we might want to fail gracefully or simulate
            // For now, let's allow it to 'fail' if it's a real attempt, but if we are in demo mode we handled it above.
            Helpers.showToast(error.message || 'Failed to upload document', 'error');
            throw error; // Re-throw to be caught by the caller
        }
    },

    setupEventListeners() {
        // Event Delegation for View Details buttons
        document.querySelector('tbody').addEventListener('click', (e) => {
            const btn = e.target.closest('.view-btn');
            if (btn) {
                const id = btn.getAttribute('data-id');
                this.openPatientModal(id);
            }
        });
    },

    // Demo Fallback
    renderDemoData() {
        console.log('Rendering demo data...');
        // 2. Hardcoded Existing Appointments (Rahul Kumar - from Screenshot)
        // We keep variable name 'demoData' to minimize code changes below
        const demoData = [
            {
                _id: 'APT-EXIST-001-' + Date.now(),
                abhaId: '12-3456-7890-1234',
                date: '2026-02-20T10:00:00', // 20 Feb 2026
                status: 'pending',
                specialty: 'General Medicine',
                condition: 'General consultation',
                description: 'Scheduled with Dr. Nair at Pushpa Kalyan Hospital.',
                reason: 'General consultation',
                userId: {
                    name: 'Rahul Kumar',
                    mobile: '9876543210',
                    age: 34,
                    gender: 'Male'
                },
                documents: []
            },
            {
                _id: 'APT-EXIST-002-' + Date.now(),
                abhaId: '12-3456-7890-1234',
                date: '2026-02-14T10:00:00', // 14 Feb 2026
                status: 'pending',
                specialty: 'Cardiology',
                condition: 'General consultation',
                description: 'Scheduled with Dr. Gupta at Khan Shakir Ali Khan Aspataal.',
                reason: 'General consultation',
                userId: {
                    name: 'Rahul Kumar',
                    mobile: '9876543210',
                    age: 34,
                    gender: 'Male'
                },
                documents: []
            }
        ];

        // Merge with LocalStorage data
        const localAppointments = JSON.parse(localStorage.getItem('swasthya_appointments') || '[]');

        // Combine: Local (newest) + Demo
        const finalData = [...localAppointments, ...demoData];

        this.state.appointments = finalData;
        this.renderTable(finalData);
        this.updateStats(finalData);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Check Auth (Admin) - RELAXED FOR DEMO
    const user = AuthService.getCurrentUser();
    // Allow if admin OR if we just want to show the demo data regardless
    if (user || Helpers.isLocal()) {
        AdminPatients.init();
    } else {
        // Fallback init for purely local testing without login
        AdminPatients.init();
    }
});
