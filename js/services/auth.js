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
        // Simulate API delay
        await Helpers.delay(AppConfig.demo.mockDelay);

        // Mock validation
        const demoUsers = AppConfig.demo.sampleUsers;
        const user = demoUsers.find(u =>
            u.type === userType &&
            (u.abhaId === identifier || u.mobile === identifier || u.email === identifier) &&
            u.password === password
        );

        if (user || AppConfig.demo.enabled) {
            // Generate mock token
            const token = 'mock_token_' + Helpers.generateId(16);

            // Create user profile
            const userProfile = {
                id: Helpers.generateId(8),
                name: user?.name || 'Demo User',
                type: userType,
                identifier: identifier,
                loginTime: new Date().toISOString()
            };

            // Save to storage
            Helpers.setStorage(AppConfig.storage.authToken, token);
            Helpers.setStorage(AppConfig.storage.userProfile, userProfile);

            // Handle Remember Me
            if (rememberMe) {
                Helpers.setStorage(AppConfig.storage.rememberMe, true);
                Helpers.setStorage(AppConfig.storage.rememberedIdentifier, identifier);
                Helpers.setStorage(AppConfig.storage.rememberedUserType, userType);
            } else {
                // Clear remember me if unchecked
                this.clearRememberedCredentials();
            }

            this.currentUser = userProfile;

            // Dispatch auth state changed event
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('authStateChanged', {
                    detail: { authenticated: true, user: userProfile }
                }));
            }

            return {
                success: true,
                message: 'Login successful',
                user: userProfile,
                token: token
            };
        }

        return {
            success: false,
            message: 'Invalid credentials',
            error: 'INVALID_CREDENTIALS'
        };
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
        await Helpers.delay(AppConfig.demo.mockDelay);

        // Validate required fields
        const required = ['name', 'mobile', 'dob'];
        const missing = required.filter(field => !userData[field]);

        if (missing.length > 0) {
            return {
                success: false,
                message: `Missing required fields: ${missing.join(', ')}`,
                error: 'MISSING_FIELDS'
            };
        }

        // In demo mode, always succeed
        if (AppConfig.demo.enabled) {
            const abhaId = Math.floor(10000000000000 + Math.random() * 90000000000000).toString();

            return {
                success: true,
                message: 'Registration successful',
                abhaId: abhaId,
                user: {
                    ...userData,
                    abhaId: abhaId,
                    id: Helpers.generateId(8)
                }
            };
        }

        return {
            success: false,
            message: 'Registration failed',
            error: 'REGISTRATION_FAILED'
        };
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
