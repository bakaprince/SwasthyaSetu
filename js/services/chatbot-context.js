/**
 * Chatbot Context Service
 * Provides patient and hospital data to the AI chatbot
 */

class ChatbotContext {
    constructor() {
        this.patientData = null;
        this.hospitalData = null;
        this.appointmentData = null;
        this.isLoggedIn = false;
    }

    /**
     * Initialize context with patient data from localStorage
     */
    async initialize() {
        // Check if user is logged in
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                this.patientData = JSON.parse(userData);
                this.isLoggedIn = true;
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }

        // Load hospital data
        await this.loadHospitalData();

        // Load patient appointments if logged in
        if (this.isLoggedIn) {
            await this.loadAppointments();
        }
    }

    /**
     * Load hospital data from JSON file
     */
    async loadHospitalData() {
        try {
            const response = await fetch('/data/hospitals.json');
            this.hospitalData = await response.json();
        } catch (error) {
            console.error('Error loading hospital data:', error);
            this.hospitalData = [];
        }
    }

    /**
     * Load patient appointments from localStorage
     */
    async loadAppointments() {
        try {
            const appointments = localStorage.getItem('appointments');
            if (appointments) {
                this.appointmentData = JSON.parse(appointments);
            } else {
                this.appointmentData = [];
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            this.appointmentData = [];
        }
    }

    /**
     * Get context string for AI
     */
    getContextString() {
        let context = '\n\n## CURRENT USER CONTEXT:\n';

        if (this.isLoggedIn && this.patientData) {
            context += `
**Patient Information:**
- Name: ${this.patientData.name || 'Not available'}
- ABHA ID: ${this.patientData.abhaId || 'Not registered'}
- Mobile: ${this.patientData.mobile || 'Not available'}
- Location: ${this.patientData.city || 'Not specified'}

**User Status:** Logged in to patient portal
`;

            // Add appointment information
            if (this.appointmentData && this.appointmentData.length > 0) {
                context += '\n**Upcoming Appointments:**\n';
                this.appointmentData.slice(0, 3).forEach((apt, index) => {
                    context += `${index + 1}. ${apt.hospital} - ${apt.department} on ${apt.date} at ${apt.time}\n`;
                });
            } else {
                context += '\n**Appointments:** No upcoming appointments\n';
            }
        } else {
            context += '**User Status:** Not logged in (Guest user)\n';
            context += '**Note:** For personalized assistance, recommend user to log in with ABHA ID\n';
        }

        // Add available hospitals information
        if (this.hospitalData && this.hospitalData.length > 0) {
            context += '\n**Available Hospitals in Network:**\n';
            this.hospitalData.slice(0, 5).forEach((hospital, index) => {
                context += `${index + 1}. ${hospital.name} (${hospital.city})\n`;
                context += `   - Departments: ${hospital.departments.slice(0, 3).join(', ')}${hospital.departments.length > 3 ? '...' : ''}\n`;
                context += `   - Beds Available: ${hospital.beds.available}/${hospital.beds.total}\n`;
                context += `   - Contact: ${hospital.contact.phone}\n`;
            });
            context += `\n(Total ${this.hospitalData.length} hospitals in network)\n`;
        }

        return context;
    }

    /**
     * Search hospitals by criteria
     */
    searchHospitals(query) {
        if (!this.hospitalData) return [];

        const lowerQuery = query.toLowerCase();
        return this.hospitalData.filter(hospital => {
            return (
                hospital.name.toLowerCase().includes(lowerQuery) ||
                hospital.city.toLowerCase().includes(lowerQuery) ||
                hospital.departments.some(dept => dept.toLowerCase().includes(lowerQuery)) ||
                hospital.specialties.some(spec => spec.toLowerCase().includes(lowerQuery))
            );
        });
    }

    /**
     * Get hospitals by department
     */
    getHospitalsByDepartment(department) {
        if (!this.hospitalData) return [];

        return this.hospitalData.filter(hospital =>
            hospital.departments.some(dept =>
                dept.toLowerCase().includes(department.toLowerCase())
            )
        );
    }

    /**
     * Get hospital by ID
     */
    getHospitalById(id) {
        if (!this.hospitalData) return null;
        return this.hospitalData.find(h => h.id === id);
    }

    /**
     * Get available departments across all hospitals
     */
    getAllDepartments() {
        if (!this.hospitalData) return [];

        const departments = new Set();
        this.hospitalData.forEach(hospital => {
            hospital.departments.forEach(dept => departments.add(dept));
        });
        return Array.from(departments).sort();
    }

    /**
     * Format hospital information for display
     */
    formatHospitalInfo(hospital) {
        return `
🏥 **${hospital.name}**
📍 ${hospital.address}
📞 ${hospital.contact.phone}
🚨 Emergency: ${hospital.contact.emergency}

**Availability:**
🛏️ Beds: ${hospital.beds.available}/${hospital.beds.total}
🏥 ICU: ${hospital.beds.icuAvailable}/${hospital.beds.icu}
🚑 Ambulances: ${hospital.resources.ambulancesAvailable}/${hospital.resources.ambulances}

**Departments:** ${hospital.departments.join(', ')}
${hospital.telemedicine ? '📱 Telemedicine Available' : ''}
⭐ Rating: ${hospital.rating}/5.0
`;
    }

    /**
     * Create appointment booking context
     */
    createAppointmentContext(details) {
        const appointment = {
            id: `APT-${Date.now()}`,
            patientName: this.patientData?.name || details.name,
            mobile: this.patientData?.mobile || details.mobile,
            hospital: details.hospital,
            department: details.department,
            date: details.date,
            time: details.time,
            reason: details.reason,
            status: 'confirmed',
            tokenNumber: `T-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            createdAt: new Date().toISOString()
        };

        // Save to localStorage
        const appointments = this.appointmentData || [];
        appointments.push(appointment);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        this.appointmentData = appointments;

        return appointment;
    }

    /**
     * Get patient's medical records summary
     */
    getMedicalRecordsSummary() {
        const records = localStorage.getItem('medicalRecords');
        if (!records) return 'No medical records available';

        try {
            const parsed = JSON.parse(records);
            return `Patient has ${parsed.length} medical record(s) on file`;
        } catch (e) {
            return 'No medical records available';
        }
    }
}

// Export singleton instance
window.ChatbotContext = new ChatbotContext();
