/**
 * API Service Layer
 * Handles all API calls with mock data for demo purposes
 */

// Helper functions for distance calculation
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

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
     * @param {object|null} userLocation - User's location {latitude, longitude}
     * @returns {Array} Array of hospital objects
     */
    getMockHospitals(userLocation = null) {
        // Real Major Hospitals in India (Fallback Data)
        let hospitals = [
            // Delhi NCR
            { id: 'H001', name: 'AIIMS New Delhi', city: 'Delhi', type: 'Government', coords: { latitude: 28.5672, longitude: 77.2100 }, address: 'Ansari Nagar, New Delhi' },
            { id: 'H002', name: 'Safdarjung Hospital', city: 'Delhi', type: 'Government', coords: { latitude: 28.5680, longitude: 77.2058 }, address: 'Ring Road, New Delhi' },
            { id: 'H003', name: 'Sir Ganga Ram Hospital', city: 'Delhi', type: 'Private', coords: { latitude: 28.6380, longitude: 77.1890 }, address: 'Rajinder Nagar, New Delhi' },
            { id: 'H004', name: 'Max Super Speciality Hospital', city: 'Delhi', type: 'Private', coords: { latitude: 28.5284, longitude: 77.2185 }, address: 'Saket, New Delhi' },
            { id: 'H005', name: 'Apollo Hospital Delhi', city: 'Delhi', type: 'Private', coords: { latitude: 28.5413, longitude: 77.2843 }, address: 'Sarita Vihar, New Delhi' },
            { id: 'H006', name: 'RML Hospital', city: 'Delhi', type: 'Government', coords: { latitude: 28.6277, longitude: 77.1977 }, address: 'Baba Kharak Singh Marg, New Delhi' },

            // Mumbai
            { id: 'H007', name: 'Tata Memorial Hospital', city: 'Mumbai', type: 'Government', coords: { latitude: 19.0142, longitude: 72.8447 }, address: 'Parel, Mumbai' },
            { id: 'H008', name: 'Lilavati Hospital', city: 'Mumbai', type: 'Private', coords: { latitude: 19.0516, longitude: 72.8317 }, address: 'Bandra West, Mumbai' },
            { id: 'H009', name: 'Kokilaben Dhirubhai Ambani Hospital', city: 'Mumbai', type: 'Private', coords: { latitude: 19.1303, longitude: 72.8335 }, address: 'Andheri West, Mumbai' },
            { id: 'H010', name: 'Breach Candy Hospital', city: 'Mumbai', type: 'Private', coords: { latitude: 18.9740, longitude: 72.8066 }, address: 'Breach Candy, Mumbai' },
            { id: 'H011', name: 'KEM Hospital', city: 'Mumbai', type: 'Government', coords: { latitude: 19.0028, longitude: 72.8427 }, address: 'Parel, Mumbai' },

            // Bangalore
            { id: 'H012', name: 'NIMHANS', city: 'Bangalore', type: 'Government', coords: { latitude: 12.9378, longitude: 77.5956 }, address: 'Hosur Road, Bangalore' },
            { id: 'H013', name: 'Manipal Hospital', city: 'Bangalore', type: 'Private', coords: { latitude: 12.9592, longitude: 77.6496 }, address: 'Old Airport Road, Bangalore' },
            { id: 'H014', name: 'Narayana Health City', city: 'Bangalore', type: 'Private', coords: { latitude: 12.8378, longitude: 77.6750 }, address: 'Bommasandra, Bangalore' },
            { id: 'H015', name: 'Fortis Hospital', city: 'Bangalore', type: 'Private', coords: { latitude: 12.8953, longitude: 77.5986 }, address: 'Bannerghatta Road, Bangalore' },

            // Chennai
            { id: 'H016', name: 'Apollo Main Hospital', city: 'Chennai', type: 'Private', coords: { latitude: 13.0645, longitude: 80.2520 }, address: 'Greams Road, Chennai' },
            { id: 'H017', name: 'CMC Vellore', city: 'Vellore', type: 'Trust', coords: { latitude: 12.9246, longitude: 79.1352 }, address: 'Vellore, Tamil Nadu' },
            { id: 'H018', name: 'Madras Medical College (GH)', city: 'Chennai', type: 'Government', coords: { latitude: 13.0822, longitude: 80.2755 }, address: 'Park Town, Chennai' },

            // Hyderabad
            { id: 'H019', name: 'Yashoda Hospital', city: 'Hyderabad', type: 'Private', coords: { latitude: 17.4390, longitude: 78.4870 }, address: 'Secunderabad, Hyderabad' },
            { id: 'H020', name: 'Apollo Health City', city: 'Hyderabad', type: 'Private', coords: { latitude: 17.4087, longitude: 78.4116 }, address: 'Jubilee Hills, Hyderabad' },
            { id: 'H021', name: 'Osmania General Hospital', city: 'Hyderabad', type: 'Government', coords: { latitude: 17.3713, longitude: 78.4735 }, address: 'Afzal Gunj, Hyderabad' },

            // Kolkata
            { id: 'H022', name: 'Apollo Gleneagles', city: 'Kolkata', type: 'Private', coords: { latitude: 22.5801, longitude: 88.3970 }, address: 'Kankurgachi, Kolkata' },
            { id: 'H023', name: 'SSKM Hospital', city: 'Kolkata', type: 'Government', coords: { latitude: 22.5385, longitude: 88.3444 }, address: 'Bhowanipore, Kolkata' },

            // Others
            { id: 'H024', name: 'PGIMER', city: 'Chandigarh', type: 'Government', coords: { latitude: 30.7634, longitude: 76.7725 }, address: 'Sector 12, Chandigarh' },
            { id: 'H025', name: 'Medanta - The Medicity', city: 'Gurgaon', type: 'Private', coords: { latitude: 28.4385, longitude: 77.0423 }, address: 'Sector 38, Gurgaon' }
        ];

        // Add dummy resource/bed data to the real list
        hospitals = hospitals.map(h => ({
            ...h,
            beds: { total: 500, available: Math.floor(Math.random() * 100), icu: 50, icuAvailable: Math.floor(Math.random() * 10) },
            resources: { oxygen: true, ventilators: true, bloodBank: true },
            contact: { phone: '011-23456789', email: 'info@hospital.com', emergency: '108' },
            rating: 4.0 + (Math.random() * 1.0)
        }));

        // If user location is provided, calculate distance and sort
        if (userLocation && userLocation.latitude && userLocation.longitude) {
            try {
                hospitals = hospitals.map(hospital => {
                    const dist = calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        hospital.coords.latitude,
                        hospital.coords.longitude
                    );
                    return { ...hospital, distance: dist.toFixed(1) };
                }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
            } catch (err) {
                console.error("Error calculating distances:", err);
            }
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

    async getHospitals(location = null) {
        // If location is available, try to fetch real data from OSM first
        if (location && location.latitude && location.longitude) {
            try {
                // Race between OSM fetch and a 3-second timeout
                const osmData = await Promise.race([
                    this.getRealHospitalsFromOSM(location),
                    new Promise((_, reject) => setTimeout(() => reject('Timeout'), 3000))
                ]);

                if (osmData && osmData.length > 0) {
                    return {
                        success: true,
                        data: osmData
                    };
                }
            } catch (error) {
                console.warn('Failed to fetch from OSM, falling back to static list:', error);
            }
        }

        // Fallback to static list (which now contains real major hospitals)
        // Pass location to body mock if needed, but here we just call local helper directly or via mock response
        return {
            success: true,
            data: this.getMockHospitals(location)
        };
    },

    /**
     * Fetch real hospitals from OpenStreetMap (Nominatim)
     */
    async getRealHospitalsFromOSM(location) {
        const { latitude, longitude } = location;

        // Define a bounding box for strict local search (approx 20km radius)
        // 1 degree lat is approx 111km, so 0.2 is approx 22km
        const delta = 0.2;
        const minLon = longitude - delta;
        const maxLon = longitude + delta;
        const minLat = latitude - delta;
        const maxLat = latitude + delta;

        // Use 'viewbox' and 'bounded=1' to restrict results to this area
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=hospital&limit=20&viewbox=${minLon},${maxLat},${maxLon},${minLat}&bounded=1`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'SwasthyaSetu-DemoApp/1.0'
            }
        });

        if (!response.ok) throw new Error('OSM API Error');

        const data = await response.json();

        // Map OSM format and filter out distant results manually as a safety net
        return data.map((item, index) => {
            // Calculate distance
            const dist = calculateDistance(
                latitude, longitude,
                parseFloat(item.lat), parseFloat(item.lon)
            );

            // Double check: if valid distance is too far (e.g. > 50km), ignore it 
            // (Mocking this filter check inside the map, usually done with .filter next)
            return {
                _tempDist: dist, // Internal use for filter
                id: `OSM${item.place_id || index}`,
                name: item.display_name.split(',')[0],
                city: (item.display_name.split(',').length > 2) ? item.display_name.split(',').slice(-4)[0].trim() : 'Local',
                type: 'Hospital',
                coords: {
                    latitude: parseFloat(item.lat),
                    longitude: parseFloat(item.lon)
                },
                distance: dist.toFixed(1),
                beds: { total: '?', available: '?', icu: '?', icuAvailable: '?' },
                resources: { oxygen: true, ventilators: true, bloodBank: true },
                contact: { phone: 'N/A', email: 'N/A', emergency: '108' },
                address: item.display_name,
                rating: 4.5
            };
        })
            .filter(h => h._tempDist < 50) // STRICT FILTER: Remove anything > 50km away
            .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
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
