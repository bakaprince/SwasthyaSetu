/**
 * Location Service
 * Handles geolocation requests and storage
 */

const LocationService = {
    /**
     * Current location data
     */
    currentLocation: null,

    /**
     * Initialize location service
     */
    init() {
        // Check if location is already saved
        const savedLocation = Helpers.getStorage(AppConfig.storage.userLocation);
        if (savedLocation) {
            this.currentLocation = savedLocation;
        }
    },

    /**
     * Request user location permission
     * @returns {Promise<object>} Location data
     */
    async requestLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject({
                    success: false,
                    message: 'Geolocation is not supported by your browser',
                    error: 'NOT_SUPPORTED'
                });
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const locationData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date().toISOString()
                    };

                    // Save location
                    this.currentLocation = locationData;
                    Helpers.setStorage(AppConfig.storage.userLocation, locationData);

                    resolve({
                        success: true,
                        message: 'Location retrieved successfully',
                        location: locationData
                    });
                },
                (error) => {
                    let errorMessage = 'Unable to retrieve location';
                    let errorCode = 'UNKNOWN_ERROR';

                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location permission denied';
                            errorCode = 'PERMISSION_DENIED';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable';
                            errorCode = 'POSITION_UNAVAILABLE';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            errorCode = 'TIMEOUT';
                            break;
                    }

                    reject({
                        success: false,
                        message: errorMessage,
                        error: errorCode
                    });
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    },

    /**
     * Get current location
     * @returns {object|null} Current location or null
     */
    getLocation() {
        return this.currentLocation;
    },

    /**
     * Check if location is available
     * @returns {boolean} Location availability status
     */
    hasLocation() {
        return this.currentLocation !== null;
    },

    /**
     * Clear saved location
     */
    clearLocation() {
        this.currentLocation = null;
        Helpers.removeStorage(AppConfig.storage.userLocation);
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        LocationService.init();
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocationService;
}
