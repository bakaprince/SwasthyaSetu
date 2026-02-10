/**
 * Authentication Service
 * Handles user authentication and session management
 */

const AuthService = {
    /**
     * Current user data
     */
    currentUser: null,

    /**
     * Initialize auth service
     */
    init() {
        // Check if user is already logged in
        const savedUser = Helpers.getStorage(AppConfig.storage.userProfile);
        const token = Helpers.getStorage(AppConfig.storage.authToken);

        if (savedUser && token) {
            this.currentUser = savedUser;
        }
    },

    /**
     * Login with ABHA ID or mobile
     * @param {string} identifier - ABHA ID or mobile number
     * @param {string} password - Password or OTP
     * @param {string} userType - 'patient' or 'admin'
     * @param {boolean} rememberMe - Whether to remember credentials
     * @returns {Promise<object>} Login response
     */
    async login(identifier, password, userType = 'patient', rememberMe = false) {
        // HACKATHON DEMO MODE: INSTANT LOGIN
        // This bypasses the actual backend authentication to avoid MongoDB delays
        console.log('🚀 DEMO MODE: Instant Login Bypass Active');

        try {
            // Mock delay for realism (optional, kept very short)
            await new Promise(resolve => setTimeout(resolve, 500));

            // Create a mock user based on the selected userType
            let mockUser = {
                id: 'demo_' + Date.now(),
                type: userType,
                loginTime: new Date().toISOString(),
                token: 'demo-token-' + Date.now()
            };

            // Set role-specific details
            if (userType === 'patient') {
                mockUser.identifier = identifier || 'demo@abdm';
                mockUser.name = 'Demo Patient';
                mockUser.mobile = '9876543210';
                mockUser.email = 'patient@demo.com';
                mockUser.age = 25;
                mockUser.gender = 'Male';
            } else if (userType === 'admin') {
                mockUser.identifier = identifier || 'hospital@demo.com';
                mockUser.name = 'Demo Hospital Admin';
                mockUser.email = 'admin@hospital.com';
            } else if (userType === 'government') {
                mockUser.identifier = identifier || 'gov_admin';
                mockUser.name = 'Demo Govt Official';
                mockUser.email = 'admin@gov.in';
            }

            // Simulate successful login response
            const responseData = {
                success: true,
                message: 'Login successful (Demo Mode)',
                user: mockUser,
                token: mockUser.token
            };

            // Save to storage
            Helpers.setStorage(AppConfig.storage.authToken, responseData.token);
            Helpers.setStorage(AppConfig.storage.userProfile, mockUser);

            // Handle Remember Me
            if (rememberMe) {
                Helpers.setStorage(AppConfig.storage.rememberMe, true);
                Helpers.setStorage(AppConfig.storage.rememberedIdentifier, identifier);
                Helpers.setStorage(AppConfig.storage.rememberedUserType, userType);
            } else {
                this.clearRememberedCredentials();
            }

            this.currentUser = mockUser;

            // Dispatch auth state changed event
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('authStateChanged', {
                    detail: { authenticated: true, user: mockUser }
                }));
            }

            return responseData;

        } catch (error) {
            console.error('Demo Login error:', error);
            return {
                success: false,
                message: 'Login failed. Please check your connection and try again.',
                error: 'CONNECTION_ERROR'
            };
        }
    },

    /**
     * Send OTP to mobile
     * @param {string} mobile - Mobile number
     * @returns {Promise<object>} OTP response
     */
    async sendOTP(mobile) {
        await Helpers.delay(AppConfig.demo.mockDelay);

        if (Helpers.validateMobile(mobile)) {
            // In demo mode, always succeed
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // In real app, this would be sent via SMS
            console.log('Demo OTP:', otp);

            // Show toast with OTP in demo mode
            if (AppConfig.demo.enabled) {
                Helpers.showToast(`Demo OTP: ${otp}`, 'info', 5000);
            }

            return {
                success: true,
                message: 'OTP sent successfully',
                otp: AppConfig.demo.enabled ? otp : undefined // Only return in demo
            };
        }

        return {
            success: false,
            message: 'Invalid mobile number',
            error: 'INVALID_MOBILE'
        };
    },

    /**
     * Verify OTP
     * @param {string} mobile - Mobile number
     * @param {string} otp - OTP to verify
     * @returns {Promise<object>} Verification response
     */
    async verifyOTP(mobile, otp) {
        await Helpers.delay(AppConfig.demo.mockDelay);

        // In demo mode, accept any 6-digit OTP
        if (AppConfig.demo.enabled && /^\d{6}$/.test(otp)) {
            return {
                success: true,
                message: 'OTP verified successfully'
            };
        }

        return {
            success: false,
            message: 'Invalid OTP',
            error: 'INVALID_OTP'
        };
    },

    /**
     * Register new user
     * @param {object} userData - User registration data
     * @returns {Promise<object>} Registration response
     */
    async register(userData) {
        try {
            // Call real backend API
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    abhaId: userData.abhaId,
                    name: userData.name,
                    mobile: userData.mobile,
                    email: userData.email,
                    password: userData.password,
                    dateOfBirth: userData.dob,
                    gender: userData.gender
                })
            });

            const data = await response.json();

            if (data.success) {
                return {
                    success: true,
                    message: 'Registration successful',
                    user: data.user
                };
            }

            return {
                success: false,
                message: data.message || 'Registration failed',
                error: 'REGISTRATION_FAILED'
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: 'Registration failed. Please check your connection and try again.',
                error: 'CONNECTION_ERROR'
            };
        }
    },

    /**
     * Logout current user
     * @returns {Promise<object>} Logout response
     */
    async logout() {
        await Helpers.delay(200);

        // Clear storage
        Helpers.removeStorage(AppConfig.storage.authToken);
        Helpers.removeStorage(AppConfig.storage.userProfile);

        // Clear remembered credentials
        this.clearRememberedCredentials();

        this.currentUser = null;

        // Dispatch auth state changed event
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('authStateChanged', {
                detail: { authenticated: false, user: null }
            }));
        }

        return {
            success: true,
            message: 'Logged out successfully'
        };
    },

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        return this.currentUser !== null;
    },

    /**
     * Get current user
     * @returns {object|null} Current user or null
     */
    getCurrentUser() {
        return this.currentUser;
    },

    /**
     * Update user profile
     * @param {object} updates - Profile updates
     * @returns {Promise<object>} Update response
     */
    async updateProfile(updates) {
        await Helpers.delay(AppConfig.demo.mockDelay);

        if (!this.isAuthenticated()) {
            return {
                success: false,
                message: 'Not authenticated',
                error: 'NOT_AUTHENTICATED'
            };
        }

        // Update current user
        this.currentUser = {
            ...this.currentUser,
            ...updates
        };

        // Save to storage
        Helpers.setStorage(AppConfig.storage.userProfile, this.currentUser);

        return {
            success: true,
            message: 'Profile updated successfully',
            user: this.currentUser
        };
    },

    /**
     * Get remembered credentials
     * @returns {object|null} Remembered credentials or null
     */
    getRememberedCredentials() {
        const rememberMe = Helpers.getStorage(AppConfig.storage.rememberMe);
        if (!rememberMe) {
            return null;
        }

        return {
            identifier: Helpers.getStorage(AppConfig.storage.rememberedIdentifier),
            userType: Helpers.getStorage(AppConfig.storage.rememberedUserType),
            rememberMe: true
        };
    },

    /**
     * Clear remembered credentials
     */
    clearRememberedCredentials() {
        Helpers.removeStorage(AppConfig.storage.rememberMe);
        Helpers.removeStorage(AppConfig.storage.rememberedIdentifier);
        Helpers.removeStorage(AppConfig.storage.rememberedUserType);
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        AuthService.init();
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}
