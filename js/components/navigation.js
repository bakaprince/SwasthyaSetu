// Navigation Component Logic
// Handles mobile menu toggle and navigation interactions

class Navigation {
    constructor() {
        this.mobileMenuOpen = false;
        this.init();
    }

    init() {
        // Initialize navigation event listeners
        // Mobile menu toggle can be added here in the future
        console.log('Navigation component initialized');

        // Set initial auth link visibility
        this.updateAuthLinks();

        // Listen for auth state changes
        window.addEventListener('authStateChanged', () => {
            this.updateAuthLinks();
        });

        // Initialize Emergency Modal
        this.initEmergencyModal();
    }

    initEmergencyModal() {
        const emergencyBtn = document.getElementById('emergency-btn');
        const modal = document.getElementById('emergency-modal');
        const closeModalBtn = document.getElementById('close-modal-btn');

        if (emergencyBtn && modal) {
            emergencyBtn.addEventListener('click', () => {
                modal.classList.remove('hidden');
            });

            const closeModal = () => {
                modal.classList.add('hidden');
            };

            if (closeModalBtn) {
                closeModalBtn.addEventListener('click', closeModal);
            }

            // Close when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });

            // Close on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                    closeModal();
                }
            });
        }
    }

    updateAuthLinks() {
        // Get all navigation links that require authentication
        const authLinks = document.querySelectorAll('.nav-auth-link[data-auth-required="true"]');
        const emergencyBtn = document.getElementById('emergency-btn');

        // Check if user is authenticated
        const isAuthenticated = AuthService && AuthService.isAuthenticated();

        // Show or hide links based on auth status
        authLinks.forEach(link => {
            if (isAuthenticated) {
                link.classList.remove('hidden');
            } else {
                link.classList.add('hidden');
            }
        });

        // Hide emergency button if authenticated
        if (emergencyBtn) {
            if (isAuthenticated) {
                emergencyBtn.classList.add('hidden');
            } else {
                emergencyBtn.classList.remove('hidden');
            }
        }

        console.log('Auth links updated. Authenticated:', isAuthenticated);
    }

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        // Add mobile menu toggle logic here
    }

    // Smooth scroll to sections
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}
