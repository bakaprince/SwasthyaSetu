/**
 * API Service Layer
 * Handles all API calls with mock data for demo purposes
 */

const APIService = {
    /**
     * Make a mock API call
     * @param {string} endpoint - API endpoint
     * @param {object} options - Request options
     * @returns {Promise} API response
     */
    async request(endpoint, options = {}) {
        const { method = 'GET', body = null, delay = 500 } = options;

        // Simulate network delay
        await Helpers.delay(delay);

        // Mock responses based on endpoint
        return this.getMockResponse(endpoint, method, body);
    },

    /**
     * Get mock response based on endpoint
     * @param {string} endpoint - API endpoint
     * @param {string} method - HTTP method
     * @param {object} body - Request body
     * @returns {object} Mock response
     */
    getMockResponse(endpoint, method, body) {
        // Health Alerts
        if (endpoint.includes('/health/alerts')) {
            return {
                success: true,
                data: [
                    {
                        id: 1,
                        title: 'Dengue Prevention Protocol',
                        severity: 'high',
                        type: 'disease',
                        description: 'Mosquito-borne viral infection cases are rising.',
                        symptoms: ['High Fever', 'Nausea', 'Pain Behind Eyes', 'Joint Aches'],
                        prevention: ['Remove stagnant water', 'Use repellents', 'Wear protective clothing'],
                        updatedAt: new Date().toISOString(),
                        source: 'National Vector Borne Disease Control'
                    },
                    {
                        id: 2,
                        title: 'Seasonal Flu',
                        severity: 'moderate',
                        type: 'disease',
                        description: 'Increasing cases of H3N2 reported.',
                        riskLevel: 65,
                        updatedAt: new Date().toISOString()
                    }
                ]
            };
        }

        // Air Quality
        if (endpoint.includes('/health/air-quality')) {
            return {
                success: true,
                data: {
                    aqi: 142,
                    level: 'Unhealthy',
                    color: 'orange',
                    recommendation: 'Sensitive groups should wear masks outdoors.',
                    updatedAt: new Date().toISOString()
                }
            };
        }

        // Hospital List
        if (endpoint.includes('/hospitals') && method === 'GET') {
            return {
                success: true,
                data: this.getMockHospitals()
            };
        }

        // Patient Profile
        if (endpoint.includes('/patient/profile')) {
            // Get current user from auth service
            const currentUser = AuthService.getCurrentUser();

            // Get saved location if available
            const savedLocation = Helpers.getStorage(AppConfig.storage.userLocation);

            // Build profile from current user data
            // Strictly hardcode profile for demo purposes as requested
            const profile = {
                id: 'P001',
                name: 'Rajesh Kumar',
                abhaId: '12-3456-7890-1234',
                mobile: '9876543210',
                email: 'rajesh.kumar@example.com',
                dateOfBirth: '1986-01-01',
                age: 40,
                gender: 'Male',
                bloodGroup: 'O+',
                address: '123, Gandhi Nagar, New Delhi, India',
                location: savedLocation ? {
                    latitude: savedLocation.latitude,
                    longitude: savedLocation.longitude,
                    city: savedLocation.city,
                    state: savedLocation.state,
                    country: savedLocation.country
                } : null,
                emergencyContact: {
                    name: 'Sita Sharma',
                    relation: 'Wife',
                    mobile: '9876543211'
                }
            };

            return {
                success: true,
                data: profile
            };
        }

        // Medical Records
        if (endpoint.includes('/patient/records')) {
            return {
                success: true,
                data: [
                    {
                        id: 'R001',
                        date: '2024-01-15',
                        hospital: 'AIIMS Delhi',
                        doctor: 'Dr. Sharma',
                        diagnosis: 'Seasonal Flu',
                        prescriptions: ['Paracetamol 500mg', 'Vitamin C'],
                        documents: ['prescription.pdf', 'lab-report.pdf']
                    },
                    {
                        id: 'R002',
                        date: '2023-12-10',
                        hospital: 'Max Hospital',
                        doctor: 'Dr. Verma',
                        diagnosis: 'Annual Checkup',
                        prescriptions: [],
                        documents: ['checkup-report.pdf']
                    }
                ]
            };
        }

        // Appointments
        if (endpoint.includes('/patient/appointments')) {
            // Get current date and future dates for appointments
            const today = new Date();
            const futureDate1 = new Date(today);
            futureDate1.setDate(today.getDate() + 5);
            const futureDate2 = new Date(today);
            futureDate2.setDate(today.getDate() + 10);
            const pastDate = new Date(today);
            pastDate.setDate(today.getDate() - 15);

            return {
                success: true,
                data: [
                    {
                        id: 'A001',
                        date: futureDate1.toISOString().split('T')[0],
                        time: '10:00 AM',
                        hospital: 'AIIMS Delhi',
                        doctor: 'Dr. Rajesh Sharma',
                        specialty: 'General Medicine',
                        department: 'General Medicine',
                        status: 'confirmed',
                        type: 'In-person',
                        reason: 'Regular checkup and consultation'
                    },
                    {
                        id: 'A002',
                        date: futureDate2.toISOString().split('T')[0],
                        time: '3:00 PM',
                        hospital: 'Apollo Hospital, Delhi',
                        doctor: 'Dr. Priya Patel',
                        specialty: 'Cardiology',
                        department: 'Cardiology',
                        status: 'confirmed',
                        type: 'Telemedicine',
                        reason: 'Follow-up consultation for heart health'
                    },
                    {
                        id: 'A003',
                        date: pastDate.toISOString().split('T')[0],
                        time: '11:30 AM',
                        hospital: 'Max Hospital, Delhi',
                        doctor: 'Dr. Amit Verma',
                        specialty: 'Orthopedics',
                        department: 'Orthopedics',
                        status: 'completed',
                        type: 'In-person',
                        reason: 'Knee pain assessment'
                    }
                ]
            };
        }

        // Default response
        return {
            success: false,
            error: 'Endpoint not found',
            message: 'This is a mock API response'
        };
    },

    /**
     * Get mock hospital data
     * @returns {Array} Array of hospital objects
     */
    getMockHospitals() {
        const hospitals = [];
        const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];
        const types = ['Government', 'Private', 'Trust'];

        for (let i = 1; i <= 20; i++) {
            hospitals.push({
                id: `H${String(i).padStart(3, '0')}`,
                name: `${types[i % 3]} Hospital ${i}`,
                city: cities[i % cities.length],
                type: types[i % 3],
                beds: {
                    total: 200 + (i * 10),
                    available: 50 + (i * 2),
                    icu: 20 + i,
                    icuAvailable: 5 + (i % 5)
                },
                resources: {
                    oxygen: i % 2 === 0,
                    ventilators: i % 3 === 0,
                    bloodBank: i % 2 === 0
                },
                contact: {
                    phone: `011-${20000000 + i}`,
                    email: `contact@hospital${i}.gov.in`,
                    emergency: '108'
                },
                address: `${i} Hospital Road, ${cities[i % cities.length]}`,
                rating: 3.5 + (i % 3) * 0.5
            });
        }

        return hospitals;
    },

    // Convenience methods for specific endpoints
    async getHealthAlerts() {
        return this.request('/health/alerts');
    },

    async getAirQuality() {
        return this.request('/health/air-quality');
    },

    async getHospitals() {
        return this.request('/hospitals');
    },

    async getPatientProfile() {
        return this.request('/patient/profile');
    },

    async getMedicalRecords() {
        return this.request('/patient/records');
    },

    async getAppointments() {
        return this.request('/patient/appointments');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIService;
}
