// Login Form Component Logic
// Handles tab switching, form validation, and OTP requests

class LoginForm {
    constructor() {
        this.activeTab = 'patient';
        this.init();
    }

    init() {
        // Initialize form event listeners
        this.setupTabSwitching();
        this.setupFormValidation();
        this.setupOTPButton();
        console.log('Login form component initialized');
    }

    setupTabSwitching() {
        // Tab switching logic
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target);
            });
        });
    }

    switchTab(button) {
        // Remove active class from all tabs
        const allTabs = document.querySelectorAll('.tab-button');
        allTabs.forEach(tab => {
            tab.classList.remove('bg-white', 'dark:bg-gray-700', 'text-secondary', 'dark:text-white', 'shadow-sm', 'ring-1', 'ring-black/5');
            tab.classList.add('text-gray-500', 'dark:text-gray-400', 'hover:text-gray-700', 'dark:hover:text-gray-200', 'hover:bg-gray-50', 'dark:hover:bg-gray-700/50');
        });

        // Add active class to clicked tab
        button.classList.remove('text-gray-500', 'dark:text-gray-400', 'hover:text-gray-700', 'dark:hover:text-gray-200', 'hover:bg-gray-50', 'dark:hover:bg-gray-700/50');
        button.classList.add('bg-white', 'dark:bg-gray-700', 'text-secondary', 'dark:text-white', 'shadow-sm', 'ring-1', 'ring-black/5');

        // Update active tab
        this.activeTab = button.dataset.tab || 'patient';
    }

    setupFormValidation() {
        const form = document.querySelector('.login-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.validateAndSubmit();
            });
        }
    }

    async validateAndSubmit() {
        const abhaInput = document.getElementById('abha-id');
        const passwordInput = document.getElementById('password');

        if (!abhaInput.value || !passwordInput.value) {
            Helpers.showToast('Please fill in all fields', 'warning');
            return false;
        }

        try {
            // Show loading state
            const submitBtn = document.querySelector('.login-form button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;

            // Attempt login
            const response = await AuthService.login(
                abhaInput.value,
                passwordInput.value,
                this.activeTab
            );

            if (response.success) {
                Helpers.showToast('Login successful!', 'success');
                console.log('Logged in user:', response.user);

                // Redirect to dashboard after short delay
                setTimeout(() => {
                    window.location.href = 'pages/dashboard.html';
                }, 1000);
            } else {
                Helpers.showToast(response.message || 'Login failed', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Login error:', error);
            Helpers.showToast('An error occurred during login', 'error');
        }

        return true;
    }

    async requestOTP() {
        const abhaInput = document.getElementById('abha-id');
        if (!abhaInput.value) {
            Helpers.showToast('Please enter your ABHA ID or mobile number first', 'warning');
            return;
        }

        try {
            // Extract mobile number if ABHA format
            let mobile = abhaInput.value;
            if (Helpers.validateMobile(mobile)) {
                const response = await AuthService.sendOTP(mobile);

                if (response.success) {
                    Helpers.showToast('OTP sent successfully!', 'success');

                    // Change password field to OTP mode
                    const passwordInput = document.getElementById('password');
                    passwordInput.placeholder = 'Enter 6-digit OTP';
                    passwordInput.maxLength = 6;
                } else {
                    Helpers.showToast(response.message || 'Failed to send OTP', 'error');
                }
            } else {
                Helpers.showToast('Please enter a valid mobile number', 'warning');
            }
        } catch (error) {
            console.error('OTP request error:', error);
            Helpers.showToast('Failed to send OTP', 'error');
        }
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoginForm;
}
