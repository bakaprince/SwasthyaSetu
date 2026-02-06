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

        // 1. Fetch Appointments (Patients)
        await this.fetchPatients();

        // 2. Setup Event Listeners
        this.setupEventListeners();
    },

    async fetchPatients() {
        try {
            // Need a valid token
            const token = AuthService.currentUser?.token;
            if (!token) return;

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
            const statusColor = this.getStatusColor(app.status);

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors';
            tr.innerHTML = `
                <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">${app._id.substring(app._id.length - 8).toUpperCase()}</td>
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

        // Re-attach listeners to new buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.openPatientModal(id);
            });
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
            const date = new Date(a.createdAt);
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

        // Populate Modal Fields (We'll inject the modal HTML if not present, or assume it exists)
        // For now, let's build a simple modal overlay safely

        let modal = document.getElementById('patient-modal');
        if (!modal) {
            // Create modal if doesn't exist
            this.createModalHTML();
            modal = document.getElementById('patient-modal');
        }

        // Fill Data
        document.getElementById('modal-patient-name').textContent = user.name || 'Unknown';
        document.getElementById('modal-patient-id').textContent = `ID: ${appointment._id}`;
        document.getElementById('modal-patient-age').textContent = `${user.age || 'N/A'} yrs, ${user.gender || 'N/A'}`;
        document.getElementById('modal-patient-mobile').textContent = user.mobile || 'N/A';
        document.getElementById('modal-appointment-date').textContent = new Date(appointment.date).toLocaleDateString();
        document.getElementById('modal-appointment-reason').textContent = appointment.reason || 'N/A';

        // Populate existing documents
        const docsList = document.getElementById('modal-docs-list');
        docsList.innerHTML = '';
        if (appointment.documents && appointment.documents.length > 0) {
            appointment.documents.forEach(doc => {
                const li = document.createElement('li');
                li.className = 'flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded';
                li.innerHTML = `
                    <span class="flex items-center gap-2">
                        <span class="material-icons-outlined text-gray-500">description</span>
                        ${doc.type} - ${new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                    <a href="${doc.url}" target="_blank" class="text-primary hover:underline">View</a>
                `;
                docsList.appendChild(li);
            });
        } else {
            docsList.innerHTML = '<li class="text-gray-500 text-sm">No documents uploaded</li>';
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
        modal.className = 'fixed inset-0 z-50 overflow-y-auto hidden';
        modal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div class="absolute inset-0 bg-gray-900 opacity-75"></div>
                </div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    
                    <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="sm:flex sm:items-start">
                            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-patient-name">Patient Name</h3>
                                <p class="text-sm text-gray-500" id="modal-patient-id">ID: 12345</p>
                                
                                <div class="mt-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-xs text-gray-500 uppercase">Age/Gender</label>
                                        <p class="text-sm font-medium dark:text-gray-300" id="modal-patient-age">--</p>
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-500 uppercase">Mobile</label>
                                        <p class="text-sm font-medium dark:text-gray-300" id="modal-patient-mobile">--</p>
                                    </div>
                                    <div class="col-span-2">
                                        <label class="block text-xs text-gray-500 uppercase">Reason</label>
                                        <p class="text-sm font-medium dark:text-gray-300" id="modal-appointment-reason">--</p>
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-500 uppercase">Date</label>
                                        <p class="text-sm font-medium dark:text-gray-300" id="modal-appointment-date">--</p>
                                    </div>
                                </div>

                                <div class="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-2">Documents</h4>
                                    <ul class="space-y-2 mb-4" id="modal-docs-list"></ul>
                                    
                                    <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-2">Upload New</h4>
                                    <div class="flex gap-2">
                                        <select id="doc-type" class="text-sm border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                            <option value="prescription">Prescription</option>
                                            <option value="diagnosis">Diagnosis</option>
                                            <option value="report">Lab Report</option>
                                            <option value="X-ray">X-ray</option>
                                            <option value="MRI">MRI</option>
                                        </select>
                                        <button id="upload-doc-btn" class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm">
                                            Upload File
                                        </button>
                                    </div>
                                    <input type="file" id="doc-file-input" class="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                         <button type="button" id="mark-completed-btn" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                            Mark Completed
                        </button>
                        <button type="button" id="close-modal-btn" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Bind Modal Events
        document.getElementById('close-modal-btn').addEventListener('click', () => this.closeModal());

        document.getElementById('mark-completed-btn').addEventListener('click', async () => {
            if (this.state.currentAppointment) {
                await this.updateStatus(this.state.currentAppointment._id, 'completed');
                this.closeModal();
                this.fetchPatients(); // Refresh list
            }
        });

        document.getElementById('upload-doc-btn').addEventListener('click', async () => {
            const type = document.getElementById('doc-type').value;
            // Simulated file upload
            Helpers.showToast('Uploading document...', 'info');
            setTimeout(async () => {
                try {
                    await this.uploadDocument(this.state.currentAppointment._id, type);
                    // Refresh modal view instead of closing to show result
                    this.openPatientModal(this.state.currentAppointment._id);
                    Helpers.showToast('Document uploaded!', 'success');
                    // Clear input
                    document.getElementById('doc-file-input').value = '';
                } catch (e) {
                    // Toast already shown
                }
            }, 1000);
        });
    },

    async updateStatus(id, status) {
        try {
            const token = AuthService.currentUser?.token;
            // Get URL similar to fetchPatients
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
            if (!token && this.state.appointments[0]?._id === 'PT-2024-001') { // Simple check for demo data
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
        // Nothing extra for now, buttons handled in render
    },

    // Demo Fallback
    renderDemoData() {
        console.log('Rendering demo data...');
        // Sample data mimicking the structure
        const demoData = [
            {
                _id: 'PT-2024-001',
                date: '2024-01-28',
                status: 'pending',
                specialty: 'Cardiology',
                reason: 'Chest pain and shortness of breath',
                userId: {
                    name: 'Rajesh Kumar',
                    mobile: '9876543210',
                    age: 45,
                    gender: 'Male'
                },
                documents: [
                    { type: 'prescription', url: '#', uploadedAt: '2024-01-28T10:00:00Z' }
                ]
            },
            {
                _id: 'PT-2024-002',
                date: '2024-01-30',
                status: 'confirmed',
                specialty: 'General Medicine',
                reason: 'High fever and fatigue',
                userId: {
                    name: 'Priya Sharma',
                    mobile: '9876543211',
                    age: 32,
                    gender: 'Female'
                },
                documents: []
            },
            {
                _id: 'PT-2024-003',
                date: '2024-02-01',
                status: 'completed',
                specialty: 'Orthopedics',
                reason: 'Fracture follow-up',
                userId: {
                    name: 'Amit Verma',
                    mobile: '9876543212',
                    age: 58,
                    gender: 'Male'
                },
                documents: [
                    { type: 'report', url: '#', uploadedAt: '2024-02-01T09:30:00Z' },
                    { type: 'X-ray', url: '#', uploadedAt: '2024-02-01T09:35:00Z' }
                ]
            },
            {
                _id: 'PT-2024-004',
                date: '2024-02-02',
                status: 'confirmed',
                specialty: 'Neurology',
                reason: 'Migraine consultation',
                userId: {
                    name: 'Sunita Devi',
                    mobile: '9876543213',
                    age: 67,
                    gender: 'Female'
                },
                documents: []
            },
            {
                _id: 'PT-2024-005',
                date: '2024-02-03',
                status: 'cancelled',
                specialty: 'Dermatology',
                reason: 'Skin rash',
                userId: {
                    name: 'Vikram Singh',
                    mobile: '9876543214',
                    age: 41,
                    gender: 'Male'
                },
                documents: []
            }
        ];

        this.state.appointments = demoData;
        this.renderTable(demoData);
        this.updateStats(demoData);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Check Auth (Admin)
    const user = AuthService.getCurrentUser();
    if (user && user.type === 'admin') {
        AdminPatients.init();
    }
});
