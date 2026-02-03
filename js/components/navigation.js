// Navigation Component Logic
// Handles mobile menu toggle and navigation interactions

class Navigation {
    constructor() {
        this.mobileMenuOpen = false;
        this.init();
    }

    init() {
        // Initialize navigation event listeners
        this.initMobileMenu();
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
        const getAmbulanceBtn = document.getElementById('btn-get-ambulance');

        if (emergencyBtn && modal) {
            emergencyBtn.addEventListener('click', () => {
                // Reset modal content if it was changed by simulation
                if (this.originalModalContent) {
                    modal.querySelector('.modal-content').innerHTML = this.originalModalContent;
                    // Re-bind events for the restored content
                    this.initEmergencyModal();
                    return; // initEmergencyModal called recursively to re-bind, so we exit this call
                }

                // Store original content on first open if not stored
                if (!this.originalModalContent) {
                    this.originalModalContent = modal.querySelector('.modal-content').innerHTML;
                }

                modal.classList.remove('hidden');
            });

            const closeModal = () => {
                modal.classList.add('hidden');
                // Optional: Reset content after a delay or immediately
                if (this.originalModalContent) {
                    setTimeout(() => {
                        modal.querySelector('.modal-content').innerHTML = this.originalModalContent;
                        // We need to re-bind events next time it opens, which is handled in the click handler above
                        // But we also need to re-bind the close button NOW if we were to re-open it without Full Reload logic
                        // Simpler approach: Just reset 'originalModalContent' usages.
                        // Actually, the cleanest way is:
                        // On open: check if we need to restore.
                    }, 300);
                }
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

            // Smart Dispatch Logic
            if (getAmbulanceBtn) {
                getAmbulanceBtn.addEventListener('click', (e) => {
                    // Check if desktop (simple width check)
                    if (window.innerWidth >= 768) {
                        e.preventDefault();
                        this.startAmbulanceDispatchSimulation(modal);
                    }
                });
            }
        }
    }

    startAmbulanceDispatchSimulation(modal) {
        const modalContent = modal.querySelector('.modal-content');
        this.originalModalContent = this.originalModalContent || modalContent.innerHTML;

        // Step 1: Initial State
        let html = `
            <div class="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            <button id="close-modal-btn-sim" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                <span class="material-icons-outlined">close</span>
            </button>
            <div class="text-center pt-4">
                <div class="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <span class="material-icons-outlined text-red-600 text-4xl">emergency_share</span>
                </div>
                <h3 class="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">Connecting to Control Room...</h3>
                <p class="text-gray-500 dark:text-gray-400 mb-8">Please wait while we fetch your location</p>

                <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-4 overflow-hidden">
                    <div class="bg-red-600 h-2.5 rounded-full animate-[loading_2s_ease-in-out_infinite]" style="width: 45%"></div>
                </div>
                <p class="text-xs text-red-500 font-bold animate-pulse">DO NOT CLOSE THIS WINDOW</p>
            </div>
        `;
        modalContent.innerHTML = html;

        // Re-bind close button
        document.getElementById('close-modal-btn-sim').addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        // Step 2: Location Found (after 2s)
        setTimeout(() => {
            // Check if modal is still open before proceeding
            if (modal.classList.contains('hidden')) return;

            html = `
                <div class="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
                <button id="close-modal-btn-sim-2" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                    <span class="material-icons-outlined">close</span>
                </button>
                <div class="text-center pt-4">
                    <div class="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                        <span class="material-icons-outlined text-green-600 text-4xl">my_location</span>
                        <span class="absolute top-0 right-0 flex h-4 w-4">
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                        </span>
                    </div>
                    <h3 class="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">Location Verified</h3>
                    <p class="text-gray-600 dark:text-gray-300 font-medium mb-1">Sector 62, Noida, Uttar Pradesh</p>
                    <p class="text-xs text-gray-500 mb-8">Accuracy: 12 meters</p>

                    <button class="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-xl animate-pulse shadow-lg flex items-center justify-center gap-2">
                        <span class="material-icons-outlined animate-spin">sync</span>
                        Dispatching Nearest Unit...
                    </button>
                </div>
            `;
            modalContent.innerHTML = html;

            // Re-bind close button
            document.getElementById('close-modal-btn-sim-2').addEventListener('click', () => {
                modal.classList.add('hidden');
            });

            // Step 3: Success (after another 2.5s)
            setTimeout(() => {
                if (modal.classList.contains('hidden')) return;

                html = `
                    <div class="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
                    <button id="close-modal-btn-sim-3" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                        <span class="material-icons-outlined">close</span>
                    </button>
                    <div class="text-center pt-4">
                        <div class="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span class="material-icons-outlined text-green-600 text-5xl">check_circle</span>
                        </div>
                        <h3 class="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">Ambulance Dispatched!</h3>

                        <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6 text-left border border-gray-100 dark:border-gray-600">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs text-gray-500 uppercase font-bold">Vehicle ID</span>
                                <span class="text-sm font-bold text-gray-900 dark:text-white">UP-16-AM-2092</span>
                            </div>
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs text-gray-500 uppercase font-bold">Driver</span>
                                <span class="text-sm font-bold text-gray-900 dark:text-white">Rajesh Kumar</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-xs text-gray-500 uppercase font-bold">ETA</span>
                                <span class="text-xl font-bold text-green-600">08 Mins</span>
                            </div>
                        </div>

                        <div class="flex gap-3">
                             <a href="tel:108" class="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                <span class="material-icons-outlined">call</span>
                                Call Driver
                            </a>
                            <button class="flex-1 bg-secondary text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition-colors">
                                Track Live
                            </button>
                        </div>
                    </div>
                `;
                modalContent.innerHTML = html;

                // Re-bind close button
                document.getElementById('close-modal-btn-sim-3').addEventListener('click', () => {
                    modal.classList.add('hidden');
                });

            }, 2500);

        }, 2000);
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

    initMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                this.toggleMobileMenu();
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target) && this.mobileMenuOpen) {
                    this.toggleMobileMenu();
                }
            });
        }
    }

    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        this.mobileMenuOpen = !this.mobileMenuOpen;

        if (this.mobileMenuOpen) {
            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.add('flex');
        } else {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('flex');
        }
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
