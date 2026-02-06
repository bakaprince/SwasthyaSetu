
class BookingWizard {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.bookingData = {
            user: {},
            hospital: null,
            department: null,
            doctor: null,
            slot: null
        };

        // Data - start with mock data, will be replaced by API data
        this.data = {
            hospitals: [
                { id: 1, name: "City General Hospital", distance: "2.5 km", rating: 4.5, address: "123 Main St, Central District" },
                { id: 2, name: "Swasthya Medical Center", distance: "4.1 km", rating: 4.8, address: "45 Green Park, North Wing" },
                { id: 3, name: "Community Health Hub", distance: "1.2 km", rating: 4.2, address: "88 Local Lane, South Block" }
            ],
            departments: [
                { id: 'cardio', name: "Cardiology", icon: "favorite" },
                { id: 'ortho', name: "Orthopedics", icon: "accessibility_new" },
                { id: 'pedia', name: "Pediatrics", icon: "child_care" },
                { id: 'derma', name: "Dermatology", icon: "face" },
                { id: 'onco', name: "Oncology", icon: "healing" },
                { id: 'gen', name: "General Medicine", icon: "medical_services" }
            ],
            doctors: [
                { id: 101, name: "Dr. Sharma", qualification: "MBBS, MD", exp: "12 years" },
                { id: 102, name: "Dr. Patel", qualification: "MBBS, MS", exp: "8 years" },
                { id: 103, name: "Dr. Mehta", qualification: "MBBS, DNB", exp: "15 years" },
                { id: 104, name: "Dr. Singh", qualification: "MBBS, MD", exp: "5 years" },
                { id: 105, name: "Dr. Rao", qualification: "MBBS", exp: "20 years" }
            ]
        };

        this.isLoadingHospitals = false;
        this.hasLoadedFromAPI = false;
        this.init();
    }

    init() {
        this.btn = document.getElementById('book-appointment-btn');
        this.modal = document.getElementById('booking-modal');
        this.closeBtn = document.getElementById('close-booking-btn');
        this.container = document.getElementById('wizard-container');

        if (this.btn && this.modal) {
            this.btn.addEventListener('click', () => this.open());
            this.closeBtn.addEventListener('click', () => this.close());

            // Step Navigation Listeners
            document.addEventListener('click', (e) => {
                if (e.target.matches('.next-step-btn')) this.nextStep();
                if (e.target.matches('.prev-step-btn')) this.prevStep();
                if (e.target.closest('.selection-card')) this.handleSelection(e.target.closest('.selection-card'));
                if (e.target.closest('.time-slot')) this.handleSlotSelection(e.target.closest('.time-slot'));
            });
        }

        // Load hospitals from API in background
        this.loadHospitals();
    }

    async loadHospitals() {
        if (this.isLoadingHospitals || this.hasLoadedFromAPI) return;

        this.isLoadingHospitals = true;
        console.log('🏥 Loading hospitals from API...');

        try {
            const response = await fetch('http://localhost:5000/api/hospitals');
            const result = await response.json();

            console.log('🏥 API Response:', result);

            if (result.success && result.data && result.data.length > 0) {
                // Transform backend data to match expected format
                this.data.hospitals = result.data.map(h => ({
                    id: h._id,
                    name: h.name,
                    distance: "N/A", // Can calculate if we have user location
                    rating: 4.5, // Use actual rating if available
                    address: h.address || `${h.city}, ${h.state}`
                }));
                this.hasLoadedFromAPI = true;
                console.log('✅ Loaded', this.data.hospitals.length, 'hospitals from API');

                // Re-render if modal is open and on hospital selection step
                if (!this.modal.classList.contains('hidden') && this.currentStep === 2) {
                    this.renderStep();
                }
            } else {
                console.warn('⚠️ No hospital data in API response, using mock data');
            }
        } catch (error) {
            console.error('❌ Error loading hospitals from API, using mock data:', error);
        } finally {
            this.isLoadingHospitals = false;
        }
    }

    async open() {
        this.modal.classList.remove('hidden');
        this.currentStep = 1;
        this.resetBooking();

        // Try to load hospitals from API if not already loaded
        if (!this.hasLoadedFromAPI) {
            this.loadHospitals();
        }

        this.renderStep();
    }

    close() {
        this.modal.classList.add('hidden');
    }

    resetBooking() {
        this.bookingData = { user: {}, hospital: null, department: null, doctor: null, slot: null };
    }

    renderStep() {
        // Update Step Indicators (if we add them)
        const html = this.getStepHTML(this.currentStep);
        this.container.innerHTML = html;

        // Re-attach specific listeners or state updates if needed
        if (this.currentStep === 1) {
            // Pre-fill if already entered
            const inputs = this.container.querySelectorAll('input, select');
            inputs.forEach(input => {
                if (this.bookingData.user[input.name]) input.value = this.bookingData.user[input.name];
            });
        }
    }

    nextStep() {
        if (this.validateStep()) {
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.renderStep();
            } else {
                // Submit Booking
                this.saveBooking();
                alert("Booking Confirmed! Your appointment has been sent to the hospital.");
                this.close();
            }
        }
    }

    saveBooking() {
        // Create appointment object matching Admin schema
        const appt = {
            _id: 'APT-' + Date.now(),
            date: new Date().toISOString(), // Current date as booking date
            status: 'pending',
            specialty: this.bookingData.department.name,
            condition: 'New Patient', // Default
            description: 'Appointment booked via online portal.',
            reason: `Consultation with ${this.bookingData.doctor.name}`,
            userId: {
                name: this.bookingData.user.name,
                mobile: this.bookingData.user.phone,
                age: this.bookingData.user.age,
                gender: this.bookingData.user.gender
            },
            documents: []
        };

        // Save to LocalStorage
        const deployments = JSON.parse(localStorage.getItem('swasthya_appointments') || '[]');
        deployments.unshift(appt);
        localStorage.setItem('swasthya_appointments', JSON.stringify(deployments));

        console.log('Booking saved locally:', appt);
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.renderStep();
        }
    }

    validateStep() {
        if (this.currentStep === 1) {
            const form = this.container.querySelector('form');
            if (!form.checkValidity()) {
                form.reportValidity();
                return false;
            }
            const formData = new FormData(form);
            this.bookingData.user = Object.fromEntries(formData.entries());
        }
        if (this.currentStep === 2 && !this.bookingData.hospital) {
            alert("Please select a hospital");
            return false;
        }
        if (this.currentStep === 3 && !this.bookingData.department) {
            alert("Please select a department");
            return false;
        }
        if (this.currentStep === 4 && (!this.bookingData.doctor || !this.bookingData.slot)) {
            alert("Please select a doctor and a time slot");
            return false;
        }
        return true;
    }

    handleSelection(element) {
        const type = element.dataset.type;
        const id = element.dataset.id;

        // Deselect others in same group
        element.parentElement.querySelectorAll('.selection-card').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');

        if (type === 'hospital') {
            this.bookingData.hospital = this.data.hospitals.find(h => h.id == id);
            setTimeout(() => this.nextStep(), 400); // Auto advance for smoother UX
        } else if (type === 'department') {
            this.bookingData.department = this.data.departments.find(d => d.id == id);
            setTimeout(() => this.nextStep(), 400);
        } else if (type === 'doctor') {
            this.bookingData.doctor = this.data.doctors.find(d => d.id == id);
            // Don't auto advance here, need slot selection
            this.bookingData.slot = null; // Reset slot if doctor changes
            this.renderSlots(id);
        }
    }

    handleSlotSelection(element) {
        if (element.disabled) return;

        document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        this.bookingData.slot = element.textContent;
    }

    renderSlots(doctorId) {
        // Generate random slots for demo
        const slotsContainer = document.getElementById('slots-container');
        if (!slotsContainer) return;

        const times = ['09:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '04:30 PM', '06:00 PM'];
        let html = '<h4 class="font-bold text-gray-700 dark:text-gray-200 mb-3 mt-4 w-full">Available Slots</h4><div class="flex flex-wrap gap-2">';

        times.forEach(time => {
            const isAvailable = Math.random() > 0.3; // Random availability
            html += `<button type="button" class="time-slot px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium ${isAvailable ? '' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}" ${isAvailable ? '' : 'disabled'}>${time}</button>`;
        });
        html += '</div>';
        slotsContainer.innerHTML = html;
        slotsContainer.classList.remove('hidden');
    }

    getStepHTML(step) {
        let content = '';
        switch (step) {
            case 1: // User Details
                content = `
                    <h3 class="text-2xl font-bold mb-6 text-secondary dark:text-white">Your Details</h3>
                    <form class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input name="name" type="text" required class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-primary focus:border-primary">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                                <input name="age" type="number" required class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-primary focus:border-primary">
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                                <select name="gender" class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-primary focus:border-primary">
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                <input name="phone" type="tel" required class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-primary focus:border-primary">
                            </div>
                        </div>
                        <div class="pt-4 flex justify-end">
                            <button type="button" class="next-step-btn bg-secondary text-white px-6 py-2 rounded-lg font-medium hover:bg-secondary-light transition-colors">Next</button>
                        </div>
                    </form>
                `;
                break;
            case 2: // Hospital Selection
                content = `
                    <div class="flex justify-between items-center mb-6">
                         <h3 class="text-2xl font-bold text-secondary dark:text-white">Select Hospital</h3>
                         <button type="button" class="prev-step-btn text-sm text-gray-500 hover:text-gray-700">Back</button>
                    </div>
                    ${this.isLoadingHospitals ? `
                        <div class="text-center py-12">
                            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p class="text-gray-500">Loading hospitals...</p>
                        </div>
                    ` : this.data.hospitals.length === 0 ? `
                        <div class="text-center py-12">
                            <span class="material-icons-outlined text-6xl text-gray-300 mb-4">local_hospital</span>
                            <p class="text-gray-500 mb-2">No hospitals found nearby</p>
                            <p class="text-sm text-gray-400">Please check your connection or try again later</p>
                        </div>
                    ` : `
                        <div class="grid gap-4">
                            ${this.data.hospitals.map(h => `
                                <div class="selection-card p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" data-type="hospital" data-id="${h.id}">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <h4 class="font-bold text-lg text-gray-900 dark:text-white">${h.name}</h4>
                                            <p class="text-sm text-gray-500">${h.address}</p>
                                        </div>
                                        <div class="text-right">
                                            <div class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold mb-1">${h.rating} ★</div>
                                            <span class="text-xs text-gray-400">${h.distance} away</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                `;
                break;
            case 3: // Department Selection
                content = `
                    <div class="flex justify-between items-center mb-6">
                         <h3 class="text-2xl font-bold text-secondary dark:text-white">Select Department</h3>
                         <button type="button" class="prev-step-btn text-sm text-gray-500 hover:text-gray-700">Back</button>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        ${this.data.departments.map(d => `
                            <div class="selection-card p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer flex flex-col items-center justify-center text-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 h-32" data-type="department" data-id="${d.id}">
                                <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <span class="material-icons-outlined text-blue-600 dark:text-blue-400">${d.icon}</span>
                                </div>
                                <span class="font-medium text-gray-900 dark:text-white">${d.name}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
                break;
            case 4: // Doctor & Slot
                content = `
                    <div class="flex justify-between items-center mb-6">
                         <h3 class="text-2xl font-bold text-secondary dark:text-white">Choose Doctor</h3>
                         <button type="button" class="prev-step-btn text-sm text-gray-500 hover:text-gray-700">Back</button>
                    </div>
                    <div class="grid grid-cols-1 gap-4 mb-6">
                         ${this.data.doctors.map(d => `
                            <div class="selection-card p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" data-type="doctor" data-id="${d.id}">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500">
                                        ${d.name.charAt(4)}
                                    </div>
                                    <div>
                                        <h4 class="font-bold text-gray-900 dark:text-white">${d.name}</h4>
                                        <p class="text-xs text-gray-500">${d.qualification} • ${d.exp} Exp</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div id="slots-container" class="hidden animate-fade-in">
                        <!-- Slots injected here -->
                    </div>
                    <div class="mt-6 flex justify-end">
                        <button type="button" class="next-step-btn bg-secondary text-white px-6 py-2 rounded-lg font-medium hover:bg-secondary-light transition-colors">Review Booking</button>
                    </div>
                `;
                break;
            case 5: // Confirmation
                const { user, hospital, department, doctor, slot } = this.bookingData;
                content = `
                    <div class="text-center mb-6">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="material-icons-outlined text-green-600 text-3xl">check_circle</span>
                        </div>
                        <h3 class="text-2xl font-bold text-secondary dark:text-white">Confirm Booking</h3>
                        <p class="text-gray-500">Please review your appointment details</p>
                    </div>

                    <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 space-y-4 mb-6 text-left border border-gray-200 dark:border-gray-700">
                        <div class="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                            <span class="text-gray-500 text-sm">Patient</span>
                            <span class="font-medium text-gray-900 dark:text-white">${user.name}</span>
                        </div>
                        <div class="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                            <span class="text-gray-500 text-sm">Hospital</span>
                            <span class="font-medium text-gray-900 dark:text-white text-right w-1/2">${hospital.name}</span>
                        </div>
                        <div class="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                            <span class="text-gray-500 text-sm">Specialty</span>
                            <span class="font-medium text-gray-900 dark:text-white">${department.name}</span>
                        </div>
                        <div class="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                            <span class="text-gray-500 text-sm">Doctor</span>
                            <span class="font-medium text-gray-900 dark:text-white">${doctor.name}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500 text-sm">Time</span>
                            <span class="font-bold text-primary dark:text-primary">${slot}</span>
                        </div>
                    </div>

                    <div class="flex gap-3">
                        <button type="button" class="prev-step-btn flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50">Edit</button>
                        <button type="button" class="next-step-btn flex-1 py-3 bg-secondary text-white rounded-xl font-bold hover:bg-secondary-light shadow-lg hover:shadow-xl transition-all">Confirm & Pay</button>
                    </div>
                `;
                break;
        }
        return content;
    }
}
