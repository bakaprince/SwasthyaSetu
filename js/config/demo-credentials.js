// Demo Credentials Configuration
// Used to prefill login forms for hackathon demonstration

const DemoCredentials = {
    enabled: true,

    // Patient Credentials (from backend/scripts/seed.js)
    patient: {
        identifier: '12-3456-7890-1234', // Rahul Kumar
        password: 'patient123'
    },

    // Hospital Admin Credentials (from backend/scripts/seed.js)
    admin: {
        identifier: '99-9999-9999-9999', // AIIMS Delhi Admin
        password: 'admin123'
    },

    // Government Credentials (from backend/scripts/seed-gov.js)
    government: {
        identifier: 'admin_gov',
        password: 'gov_password_123'
    }
};

// Prevent modification in browser console
Object.freeze(DemoCredentials);
