// Main JavaScript Entry Point
// Initializes all components and sets up global event listeners

document.addEventListener('DOMContentLoaded', function () {
    console.log('SwasthyaSetu application initialized');

    // Initialize Navigation
    if (typeof Navigation !== 'undefined') {
        const navigation = new Navigation();
    }

    // Initialize Login Form
    if (typeof LoginForm !== 'undefined') {
        const loginForm = new LoginForm();
    }

    // Initialize Location Service and show modal if needed
    initializeLocationService();

    // Add smooth scroll behavior to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Dark mode toggle (if needed in the future)
    // const darkModeToggle = document.getElementById('dark-mode-toggle');
    // if (darkModeToggle) {
    //     darkModeToggle.addEventListener('click', toggleDarkMode);
    // }
});

// Initialize Location Service
function initializeLocationService() {
    // Check if LocationService is available
    if (typeof LocationService === 'undefined') {
        console.warn('LocationService not loaded');
        return;
    }

    // Check if location modal exists on this page
    const modal = document.getElementById('location-modal');
    if (!modal) {
        console.log('Location modal not found on this page');
        return;
    }

    // Check if location permission was already handled
    const locationHandled = localStorage.getItem('swasthyasetu_location_handled');

    console.log('Location handled:', locationHandled);
    console.log('Has location:', LocationService.hasLocation());

    if (!locationHandled && !LocationService.hasLocation()) {
        // Show location modal after a short delay
        console.log('Showing location modal in 1 second...');
        setTimeout(() => {
            showLocationModal();
        }, 1000);
    }
}

// Show Location Modal
function showLocationModal() {
    const modal = document.getElementById('location-modal');
    if (modal) {
        modal.classList.remove('hidden');

        // Allow location button
        const allowBtn = document.getElementById('allow-location-btn');
        if (allowBtn) {
            allowBtn.addEventListener('click', async () => {
                allowBtn.disabled = true;
                allowBtn.innerHTML = '<span class="material-icons-outlined animate-spin">refresh</span><span>Getting Location...</span>';

                try {
                    const result = await LocationService.requestLocation();
                    if (result.success) {
                        Helpers.showToast('Location access granted!', 'success');
                        localStorage.setItem('swasthyasetu_location_handled', 'true');
                        hideLocationModal();
                    }
                } catch (error) {
                    Helpers.showToast(error.message || 'Failed to get location', 'error');
                    allowBtn.disabled = false;
                    allowBtn.innerHTML = '<span class="material-icons-outlined">my_location</span><span>Allow Location Access</span>';
                }
            });
        }

        // Skip button
        const skipBtn = document.getElementById('skip-location-btn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                localStorage.setItem('swasthyasetu_location_handled', 'true');
                hideLocationModal();
                Helpers.showToast('You can enable location later in settings', 'info');
            });
        }
    }
}

// Hide Location Modal
function hideLocationModal() {
    const modal = document.getElementById('location-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Utility function for dark mode toggle
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
}

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark');
}
