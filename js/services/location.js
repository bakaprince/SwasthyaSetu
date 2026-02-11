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
                async (position) => {
                    const locationData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date().toISOString()
                    };

                    // Try to get address from reverse geocoding
                    try {
                        const addressData = await this.reverseGeocode(
                            locationData.latitude,
                            locationData.longitude
                        );

                        if (addressData) {
                            locationData.city = addressData.city;
                            locationData.state = addressData.state;
                            locationData.country = addressData.country;
                            locationData.address = addressData.formattedAddress;
                        }
                    } catch (error) {
                        console.warn('Reverse geocoding failed:', error);
                        // Continue with just coordinates
                        locationData.address = `${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}`;
                    }

                    // Save location
                    this.currentLocation = locationData;
                    Helpers.setStorage(AppConfig.storage.userLocation, locationData);

                    // Dispatch custom event for other services to listen
                    window.dispatchEvent(new CustomEvent('locationUpdated', {
                        detail: locationData
                    }));

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

                    // HACKATHON: Graceful fallback to Madhya Pradesh coordinates
                    console.warn('Geolocation error:', errorMessage, '- Using fallback location');

                    const fallbackLocation = {
                        latitude: 23.2599,
                        longitude: 77.4126,
                        city: 'Bhopal',
                        state: 'Madhya Pradesh',
                        country: 'India',
                        address: 'Bhopal, Madhya Pradesh, India',
                        accuracy: 0,
                        timestamp: new Date().toISOString(),
                        isFallback: true
                    };

                    // Save fallback location
                    this.currentLocation = fallbackLocation;
                    Helpers.setStorage(AppConfig.storage.userLocation, fallbackLocation);

                    // Dispatch event with fallback location
                    window.dispatchEvent(new CustomEvent('locationUpdated', {
                        detail: fallbackLocation
                    }));

                    // Resolve with fallback instead of rejecting
                    resolve({
                        success: true,
                        message: `Using default location: ${fallbackLocation.city}`,
                        location: fallbackLocation,
                        fallback: true,
                        originalError: errorCode
                    });
                },
                {
                    // HACKATHON OPTIMIZATION: Fast, non-blocking geolocation
                    enableHighAccuracy: false,  // Was: true (saves 3-5 seconds)
                    timeout: 3000,              // Was: 10000 (faster failure)
                    maximumAge: 60000           // Was: 0 (cache for 60 seconds)
                }
            );
        });
    },

    /**
     * Reverse geocode coordinates to get address
     * @param {number} latitude - Latitude
     * @param {number} longitude - Longitude
     * @returns {Promise<object>} Address data
     */
    async reverseGeocode(latitude, longitude) {
        try {
            // Using OpenStreetMap Nominatim API (free, no API key required)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'SwasthyaSetu/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Geocoding request failed');
            }

            const data = await response.json();

            if (data && data.address) {
                return {
                    city: data.address.city || data.address.town || data.address.village || 'Unknown',
                    state: data.address.state || data.address.region || 'Unknown',
                    country: data.address.country || 'Unknown',
                    formattedAddress: data.display_name || `${latitude}, ${longitude}`
                };
            }

            return null;
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return null;
        }
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
