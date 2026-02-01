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
    }

    updateAuthLinks() {
        // Get all navigation links that require authentication
        const authLinks = document.querySelectorAll('.nav-auth-link[data-auth-required="true"]');

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
