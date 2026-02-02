// Login Form Component Logic
// Handles tab switching, form validation, and OTP requests

console.log('🔄 LOGIN-FORM.JS VERSION 3 LOADED');

class LoginForm {
    constructor() {
        this.activeTab = 'patient';
        this.init();
    }

    init() {
        // Initialize form event listeners
        this.setupTabSwitching();
        this.setupFormValidation();
        this.setupPasswordToggle();

        // Set initial form fields for patient tab
        this.updateFormFields();

        // Load remembered credentials if available
        this.loadRememberedCredentials();

        console.log('Login form component initialized');
    }

    loadRememberedCredentials() {
        const remembered = AuthService.getRememberedCredentials();
        if (remembered) {
            // Set the active tab to the remembered user type
            this.activeTab = remembered.userType;

            // Update tab UI
            const tabButtons = document.querySelectorAll('.tab-button');
            tabButtons.forEach(button => {
                if (button.dataset.tab === remembered.userType) {
                    button.classList.remove('text-gray-500', 'dark:text-gray-400', 'hover:text-gray-700', 'dark:hover:text-gray-200', 'hover:bg-gray-50', 'dark:hover:bg-gray-700/50');
                    button.classList.add('bg-white', 'dark:bg-gray-700', 'text-secondary', 'dark:text-white', 'shadow-sm', 'ring-1', 'ring-black/5');
                } else {
                    button.classList.add('text-gray-500', 'dark:text-gray-400', 'hover:text-gray-700', 'dark:hover:text-gray-200', 'hover:bg-gray-50', 'dark:hover:bg-gray-700/50');
                    button.classList.remove('bg-white', 'dark:bg-gray-700', 'text-secondary', 'dark:text-white', 'shadow-sm', 'ring-1', 'ring-black/5');
                }
            });

            // Update form fields for the correct tab
            this.updateFormFields();

            // Fill in the identifier
            const abhaInput = document.getElementById('abha-id');
            if (abhaInput && remembered.identifier) {
                abhaInput.value = remembered.identifier;
            }

            // Check the remember me checkbox
            const rememberCheckbox = document.getElementById('remember-me');
            if (rememberCheckbox) {
                rememberCheckbox.checked = true;
            }
        }
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

        // Update form fields based on active tab
        this.updateFormFields();
    }

    updateFormFields() {
        const idLabel = document.querySelector('label[for="abha-id"]');
        const idInput = document.getElementById('abha-id');
        const passwordLabel = document.querySelector('label[for="password"]');
        const passwordInput = document.getElementById('password');
        // Removed otpButton reference
        const abhaSection = document.querySelector('.login-form').parentElement.querySelector('.mt-6');

        if (this.activeTab === 'patient') {
            // Patient form fields
            idLabel.textContent = 'ABHA Address / Mobile Number';
            idInput.placeholder = 'e.g. name@abdm';
            passwordLabel.textContent = 'Password / OTP';
            passwordInput.placeholder = '••••••••';
            passwordInput.type = 'password';

            passwordInput.placeholder = '••••••••';
            passwordInput.type = 'password';
            this.updateToggleIcon(false);

            // Show ABHA creation section
            if (abhaSection) {
                abhaSection.style.visibility = 'visible';
                abhaSection.style.opacity = '1';
                abhaSection.style.height = 'auto';
                abhaSection.style.overflow = 'visible';
                abhaSection.style.pointerEvents = 'auto';
                abhaSection.style.transition = 'opacity 0.2s ease, height 0.2s ease';
            }
        } else {
            // Hospital admin form fields
            idLabel.textContent = 'Hospital ID / Email';
            idInput.placeholder = 'e.g. hospital@example.com';
            passwordLabel.textContent = 'Admin Password';
            passwordInput.placeholder = '••••••••';
            passwordInput.type = 'password';

            passwordInput.placeholder = '••••••••';
            passwordInput.type = 'password';
            this.updateToggleIcon(false);

            // Previously we hid OTP button here, now toggle is always visible for password fields

            // Hide ABHA creation section but maintain space
            if (abhaSection) {
                abhaSection.style.visibility = 'hidden';
                abhaSection.style.opacity = '0';
                abhaSection.style.height = '0';
                abhaSection.style.overflow = 'hidden';
                abhaSection.style.pointerEvents = 'none';
                abhaSection.style.transition = 'opacity 0.2s ease, height 0.2s ease';
            }
        }

        // Clear form inputs when switching tabs
        idInput.value = '';
        passwordInput.value = '';

        // Check if we have remembered credentials for this tab
        const remembered = AuthService.getRememberedCredentials();
        if (remembered && remembered.userType === this.activeTab) {
            idInput.value = remembered.identifier;
            const rememberCheckbox = document.getElementById('remember-me');
            if (rememberCheckbox) {
                rememberCheckbox.checked = true;
            }
        } else {
            // Uncheck remember me if switching to different user type
            const rememberCheckbox = document.getElementById('remember-me');
            if (rememberCheckbox) {
                rememberCheckbox.checked = false;
            }
        }
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

            // Get remember me checkbox state
            const rememberCheckbox = document.getElementById('remember-me');
            const rememberMe = rememberCheckbox ? rememberCheckbox.checked : false;

            console.log('🔍 BEFORE LOGIN CALL');

            // Attempt login
            const response = await AuthService.login(
                abhaInput.value,
                passwordInput.value,
                this.activeTab,
                rememberMe
            );

            console.log('🔍 AFTER LOGIN CALL - Response:', response);
            console.log('🔍 Response type:', typeof response);
            console.log('🔍 Response.success:', response?.success);
            console.log('🔍 Response keys:', response ? Object.keys(response) : 'null');

            // Check if login was successful (multiple ways)
            const isSuccess = response && (response.success === true || response.success === 'true' || response.token || response.user);

            console.log('🔍 Is Success:', isSuccess);

            if (isSuccess) {
                console.log('=== LOGIN SUCCESS CONFIRMED ===');
                console.log('Full response:', JSON.stringify(response, null, 2));

                Helpers.showToast('Login successful!', 'success');

                // Determine user role
                const userRole = response.user?.type || this.activeTab;
                console.log('🎯 User role:', userRole);

                // Force immediate redirect
                const redirectUrl = userRole === 'patient' ? 'pages/dashboard.html' : 'pages/admin-dashboard.html';
                console.log('🚀 FORCING REDIRECT TO:', redirectUrl);

                // FORCE REDIRECT - Multiple methods
                console.log('⏱️ Setting timeout for redirect...');
                setTimeout(() => {
                    console.log('⚡ EXECUTING REDIRECT NOW!');
                    window.location.href = redirectUrl;
                }, 100);

                // Also try immediate redirect as backup
                console.log('⚡ ALSO TRYING IMMEDIATE REDIRECT');
                window.location.replace(redirectUrl);

            } else {
                console.log('❌ LOGIN FAILED');
                Helpers.showToast(response?.message || 'Login failed', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('💥 Login error:', error);
            Helpers.showToast('An error occurred during login', 'error');
        }

        return true;
    }

    setupPasswordToggle() {
        const toggleBtn = document.getElementById('password-toggle');
        const passwordInput = document.getElementById('password');

        if (toggleBtn && passwordInput) {
            toggleBtn.addEventListener('click', () => {
                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';
                this.updateToggleIcon(!isPassword);
            });
        }
    }

    updateToggleIcon(isVisible) {
        const toggleBtn = document.getElementById('password-toggle');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('.material-icons-outlined');
            if (icon) {
                icon.textContent = isVisible ? 'visibility_off' : 'visibility';
            }
        }
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoginForm;
}
