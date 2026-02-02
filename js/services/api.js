/**
 * API Service Layer - Fixed for Backend Connection
 */

const APIService = {
    // Use environment-based URL: production Vercel URL or local development
    baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : '/api',

    getToken() {
        const user = AuthService?.getCurrentUser();
        return user?.token || localStorage.getItem('authToken') || null;
    },

    async request(endpoint, options = {}) {
        const { method = 'GET', body = null } = options;

        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const config = {
                method,
                headers,
                mode: 'cors'
            };

            if (body && method !== 'GET') {
                config.body = JSON.stringify(body);
            }

            console.log(`API Call: ${method} ${this.baseURL}${endpoint}`);

            const response = await fetch(`${this.baseURL}${endpoint}`, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Network error' }));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('API Error:', error);

            if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
                throw new Error('Backend server not running. Please start: npm run dev');
            }

            throw error;
        }
    },

    // Test connection
    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL}/health-check`);
            return response.ok;
        } catch (error) {
            return false;
        }
    },

    async getHealthAlerts() {
        return this.request('/health/alerts');
    },

    async getHospitals() {
        return this.request('/hospitals');
    },

    async getPatientProfile() {
        return this.request('/profile');
    },

    async getAppointments() {
        return this.request('/appointments');
    },

    async createAppointment(appointmentData) {
        return this.request('/appointments', {
            method: 'POST',
            body: appointmentData
        });
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIService;
}
