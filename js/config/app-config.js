/**
 * Application Configuration
 * Centralized configuration for the SwasthyaSetu application
 */

const AppConfig = {
    // Application Info
    app: {
        name: 'SwasthyaSetu',
        displayName: 'SwasthyaSetu',
        version: '1.0.0',
        description: 'Government Health Portal - Unified Medical Access Platform'
    },

    // API Configuration (Mock endpoints for demo)
    api: {
        baseUrl: '/api',
        endpoints: {
            auth: {
                login: '/auth/login',
                logout: '/auth/logout',
                register: '/auth/register',
                verifyOTP: '/auth/verify-otp',
                sendOTP: '/auth/send-otp'
            },
            patient: {
                profile: '/patient/profile',
                records: '/patient/records',
                appointments: '/patient/appointments',
                prescriptions: '/patient/prescriptions'
            },
            hospital: {
                list: '/hospitals',
                details: '/hospitals/:id',
                resources: '/hospitals/:id/resources',
                availability: '/hospitals/:id/availability'
            },
            health: {
                alerts: '/health/alerts',
                diseases: '/health/diseases',
                airQuality: '/health/air-quality'
            }
        },
        timeout: 10000,
        retryAttempts: 3
    },

    // Feature Flags
    features: {
        telemedicine: true,
        abhaIntegration: true,
        hospitalTransfer: true,
        resourceTracking: true,
        healthAlerts: true,
        darkMode: true,
        multiLanguage: false
    },

    // UI Configuration
    ui: {
        defaultTheme: 'light',
        animationDuration: 300,
        toastDuration: 3000,
        itemsPerPage: 10
    },

    // Storage Keys
    storage: {
        authToken: 'swasthyasetu_auth_token',
        userProfile: 'swasthyasetu_user_profile',
        userLocation: 'swasthyasetu_user_location',
        aqiData: 'swasthyasetu_aqi',
        theme: 'swasthyasetu_theme',
        language: 'swasthyasetu_language',
        rememberMe: 'swasthyasetu_remember_me',
        rememberedIdentifier: 'swasthyasetu_remembered_identifier',
        rememberedUserType: 'swasthyasetu_remembered_user_type'
    },

    // Validation Rules
    validation: {
        abha: {
            minLength: 14,
            maxLength: 14,
            pattern: /^\d{14}$/
        },
        mobile: {
            minLength: 10,
            maxLength: 10,
            pattern: /^[6-9]\d{9}$/
        },
        otp: {
            length: 6,
            pattern: /^\d{6}$/
        }
    },

    // Demo Mode Settings
    demo: {
        enabled: true,
        autoLogin: false,
        mockDelay: 500, // Simulate API delay in ms
        sampleUsers: [
            {
                type: 'patient',
                abhaId: '12345678901234',
                mobile: '9876543210',
                password: 'demo123',
                name: 'Rajesh Kumar',
                age: 42,
                gender: 'Male',
                dob: '1984-01-01'
            },
            {
                type: 'admin',
                email: 'admin@hospital.gov.in',
                password: 'admin123',
                hospital: 'AIIMS Delhi'
            }
        ]
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
}
