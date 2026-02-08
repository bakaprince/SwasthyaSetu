/**
 * AQI Service
 * Handles Air Quality Index data fetching and processing
 */

const AQIService = {
    /**
     * Cached AQI data
     */
    currentAQI: null,

    /**
     * Cache duration in milliseconds (30 minutes)
     */
    cacheDuration: 30 * 60 * 1000,

    /**
     * Initialize AQI service
     */
    init() {
        console.log('AQIService: Initializing...');

        // Check if AQI data is already cached
        const cachedAQI = Helpers.getStorage(AppConfig.storage.aqiData || 'swasthyasetu_aqi');
        if (cachedAQI && this.isCacheValid(cachedAQI)) {
            console.log('AQIService: Using cached AQI data', cachedAQI);
            this.currentAQI = cachedAQI;
            this.updateUI(cachedAQI);
        } else {
            console.log('AQIService: No valid cached data found');
        }

        // Listen for location updates
        window.addEventListener('locationUpdated', (event) => {
            console.log('AQIService: Location updated event received', event.detail);
            if (event.detail && event.detail.latitude && event.detail.longitude) {
                this.fetchAQI(event.detail.latitude, event.detail.longitude);
            }
        });

        // If location is already available, fetch AQI
        if (typeof LocationService !== 'undefined' && LocationService.hasLocation()) {
            const location = LocationService.getLocation();
            console.log('AQIService: Location already available', location);
            if (location && location.latitude && location.longitude) {
                this.fetchAQI(location.latitude, location.longitude);
            }
        } else {
            console.log('AQIService: No location available yet, waiting for location update event');
        }

        console.log('AQIService: Initialization complete');
    },

    /**
     * Check if cached data is still valid
     * @param {object} cachedData - Cached AQI data
     * @returns {boolean} Whether cache is valid
     */
    isCacheValid(cachedData) {
        if (!cachedData || !cachedData.timestamp) {
            return false;
        }
        const now = new Date().getTime();
        const cacheTime = new Date(cachedData.timestamp).getTime();
        return (now - cacheTime) < this.cacheDuration;
    },

    /**
     * Fetch AQI data from API
     * @param {number} latitude - Latitude
     * @param {number} longitude - Longitude
     * @returns {Promise<object>} AQI data
     */
    async fetchAQI(latitude, longitude) {
        console.log(`AQIService: Fetching AQI for coordinates: ${latitude}, ${longitude}`);

        try {
            // Show loading state
            this.updateUILoading();

            // Try WAQI API first
            console.log('AQIService: Trying WAQI API...');
            const waqiData = await this.fetchFromWAQI(latitude, longitude);

            if (waqiData) {
                console.log('AQIService: WAQI API success', waqiData);
                const aqiData = this.processAQIData(waqiData);
                console.log('AQIService: Processed AQI data', aqiData);
                this.currentAQI = aqiData;

                // Cache the data
                Helpers.setStorage(AppConfig.storage.aqiData || 'swasthyasetu_aqi', aqiData);

                // Update UI
                this.updateUI(aqiData);

                // Dispatch event
                window.dispatchEvent(new CustomEvent('aqiUpdated', { detail: aqiData }));

                return aqiData;
            }

            // Fallback to OpenAQ API
            console.log('AQIService: WAQI failed, trying OpenAQ API...');
            const openAQData = await this.fetchFromOpenAQ(latitude, longitude);

            if (openAQData) {
                console.log('AQIService: OpenAQ API success', openAQData);
                const aqiData = this.processOpenAQData(openAQData);
                console.log('AQIService: Processed AQI data', aqiData);
                this.currentAQI = aqiData;

                // Cache the data
                Helpers.setStorage(AppConfig.storage.aqiData || 'swasthyasetu_aqi', aqiData);

                // Update UI
                this.updateUI(aqiData);

                // Dispatch event
                window.dispatchEvent(new CustomEvent('aqiUpdated', { detail: aqiData }));

                return aqiData;
            }

            // If both APIs fail, use fallback data
            throw new Error('Unable to fetch AQI data from any source');

        } catch (error) {
            console.error('AQI fetch error:', error);

            // Use fallback data
            console.log('AQIService: Using fallback data');
            const fallbackData = this.getFallbackData();
            this.updateUI(fallbackData);

            return fallbackData;
        }
    },

    /**
     * Fetch AQI from WAQI API
     * @param {number} latitude - Latitude
     * @param {number} longitude - Longitude
     * @returns {Promise<object|null>} WAQI response or null
     */
    async fetchFromWAQI(latitude, longitude) {
        try {
            // Production token for unlimited requests
            const token = '3e0b407997d473d7fa6e599433a8c01d75b3cda4';
            const url = `https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${token}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('WAQI API request failed');
            }

            const data = await response.json();

            if (data.status === 'ok' && data.data) {
                return data.data;
            }

            return null;
        } catch (error) {
            console.warn('WAQI API error:', error);
            return null;
        }
    },

    /**
     * Fetch AQI from OpenAQ API
     * @param {number} latitude - Latitude
     * @param {number} longitude - Longitude
     * @returns {Promise<object|null>} OpenAQ response or null
     */
    async fetchFromOpenAQ(latitude, longitude) {
        try {
            // OpenAQ API v2 - find nearest location
            const radius = 25000; // 25km radius
            const url = `https://api.openaq.org/v2/latest?coordinates=${latitude},${longitude}&radius=${radius}&limit=1`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('OpenAQ API request failed');
            }

            const data = await response.json();

            if (data.results && data.results.length > 0) {
                return data.results[0];
            }

            return null;
        } catch (error) {
            console.warn('OpenAQ API error:', error);
            return null;
        }
    },

    /**
     * Process WAQI API data
     * @param {object} data - WAQI API response
     * @returns {object} Processed AQI data
     */
    processAQIData(data) {
        const aqi = data.aqi || 0;
        const level = this.getAQILevel(aqi);

        // Get city from LocationService first, fallback to API data
        let city = 'Your Location';
        if (LocationService && LocationService.hasLocation()) {
            const location = LocationService.getLocation();
            if (location) {
                // If city is available and not "Unknown", use it
                if (location.city && location.city !== 'Unknown') {
                    city = location.city;
                    // Add state if available
                    if (location.state && location.state !== 'Unknown') {
                        city += `, ${location.state}`;
                    }
                } else if (location.state && location.state !== 'Unknown') {
                    // If city is Unknown but state is available, show only state
                    city = location.state;
                }
            }
        } else if (data.city?.name) {
            city = data.city.name;
        }

        return {
            aqi: aqi,
            level: level.name,
            color: level.color,
            recommendation: level.recommendation,
            city: city,
            timestamp: new Date().toISOString(),
            source: 'WAQI'
        };
    },

    /**
     * Process OpenAQ API data
     * @param {object} data - OpenAQ API response
     * @returns {object} Processed AQI data
     */
    processOpenAQData(data) {
        // OpenAQ provides PM2.5, convert to AQI
        const pm25Measurement = data.measurements?.find(m => m.parameter === 'pm25');
        const pm25 = pm25Measurement?.value || 0;

        // Convert PM2.5 to AQI (simplified US EPA formula)
        const aqi = this.pm25ToAQI(pm25);
        const level = this.getAQILevel(aqi);

        // Get city from LocationService first, fallback to API data
        let city = 'Your Location';
        if (LocationService && LocationService.hasLocation()) {
            const location = LocationService.getLocation();
            if (location) {
                // If city is available and not "Unknown", use it
                if (location.city && location.city !== 'Unknown') {
                    city = location.city;
                    // Add state if available
                    if (location.state && location.state !== 'Unknown') {
                        city += `, ${location.state}`;
                    }
                } else if (location.state && location.state !== 'Unknown') {
                    // If city is Unknown but state is available, show only state
                    city = location.state;
                }
            }
        } else if (data.location) {
            city = data.location;
        }

        return {
            aqi: Math.round(aqi),
            level: level.name,
            color: level.color,
            recommendation: level.recommendation,
            city: city,
            timestamp: new Date().toISOString(),
            source: 'OpenAQ'
        };
    },

    /**
     * Convert PM2.5 to AQI (US EPA formula - simplified)
     * @param {number} pm25 - PM2.5 concentration
     * @returns {number} AQI value
     */
    pm25ToAQI(pm25) {
        if (pm25 <= 12.0) {
            return this.linearScale(pm25, 0, 12.0, 0, 50);
        } else if (pm25 <= 35.4) {
            return this.linearScale(pm25, 12.1, 35.4, 51, 100);
        } else if (pm25 <= 55.4) {
            return this.linearScale(pm25, 35.5, 55.4, 101, 150);
        } else if (pm25 <= 150.4) {
            return this.linearScale(pm25, 55.5, 150.4, 151, 200);
        } else if (pm25 <= 250.4) {
            return this.linearScale(pm25, 150.5, 250.4, 201, 300);
        } else {
            return this.linearScale(pm25, 250.5, 500.4, 301, 500);
        }
    },

    /**
     * Linear scale helper
     * @param {number} value - Input value
     * @param {number} inMin - Input minimum
     * @param {number} inMax - Input maximum
     * @param {number} outMin - Output minimum
     * @param {number} outMax - Output maximum
     * @returns {number} Scaled value
     */
    linearScale(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    },

    /**
     * Get AQI level information
     * @param {number} aqi - AQI value
     * @returns {object} Level information
     */
    getAQILevel(aqi) {
        if (aqi <= 50) {
            return {
                name: 'Good',
                color: 'green',
                recommendation: 'Air quality is satisfactory. Enjoy outdoor activities!'
            };
        } else if (aqi <= 100) {
            return {
                name: 'Moderate',
                color: 'yellow',
                recommendation: 'Air quality is acceptable for most people.'
            };
        } else if (aqi <= 150) {
            return {
                name: 'Unhealthy for Sensitive Groups',
                color: 'orange',
                recommendation: 'Sensitive groups should limit prolonged outdoor activities.'
            };
        } else if (aqi <= 200) {
            return {
                name: 'Unhealthy',
                color: 'red',
                recommendation: 'Everyone should limit prolonged outdoor activities.'
            };
        } else if (aqi <= 300) {
            return {
                name: 'Very Unhealthy',
                color: 'purple',
                recommendation: 'Health alert! Everyone should avoid outdoor activities.'
            };
        } else {
            return {
                name: 'Hazardous',
                color: 'maroon',
                recommendation: 'Health warning! Stay indoors and keep windows closed.'
            };
        }
    },

    /**
     * Get fallback AQI data
     * @returns {object} Fallback data
     */
    getFallbackData() {
        return {
            aqi: 142,
            level: 'Unhealthy for Sensitive Groups',
            color: 'orange',
            recommendation: 'Sensitive groups should wear masks outdoors.',
            city: 'Your Location',
            timestamp: new Date().toISOString(),
            source: 'Fallback'
        };
    },

    /**
     * Set loading state in UI
     */
    updateUILoading() {
        const aqiValueEl = document.getElementById('aqi-value');
        const aqiLevelEl = document.getElementById('aqi-level');
        const aqiRecommendationEl = document.getElementById('aqi-recommendation');
        const aqiCityEl = document.getElementById('aqi-city');
        const aqiIconEl = document.querySelector('.aqi-advice .material-icons-outlined');

        if (aqiValueEl) {
            aqiValueEl.textContent = '...';
            aqiValueEl.className = 'block text-2xl font-bold text-gray-400 aqi-value';
        }
        if (aqiLevelEl) {
            aqiLevelEl.textContent = 'Loading';
            aqiLevelEl.className = 'text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded aqi-status';
        }
        if (aqiRecommendationEl) {
            aqiRecommendationEl.textContent = 'Fetching air quality data...';
        }
        if (aqiCityEl) {
            aqiCityEl.textContent = 'Updating...';
        }
        if (aqiIconEl) {
            aqiIconEl.textContent = 'location_searching';
            aqiIconEl.classList.add('animate-pulse');
        }
    },

    /**
     * Update UI with AQI data
     * @param {object} aqiData - AQI data
     */
    updateUI(aqiData) {
        console.log('AQIService: Updating UI with data', aqiData);

        const aqiValueEl = document.getElementById('aqi-value');
        const aqiLevelEl = document.getElementById('aqi-level');
        const aqiRecommendationEl = document.getElementById('aqi-recommendation');
        const aqiCityEl = document.getElementById('aqi-city');
        const aqiIndicatorEl = document.getElementById('aqi-indicator');
        const aqiIconEl = document.querySelector('.aqi-advice .material-icons-outlined');

        if (aqiValueEl) {
            aqiValueEl.textContent = aqiData.aqi;
            const colorClass = this.getColorClass(aqiData.color);
            aqiValueEl.className = `block text-2xl font-bold text-${colorClass}-600 aqi-value`;
        }

        if (aqiLevelEl) {
            aqiLevelEl.textContent = aqiData.level;
            const colorClass = this.getColorClass(aqiData.color);
            aqiLevelEl.className = `text-xs font-bold bg-${colorClass}-100 text-${colorClass}-700 px-1.5 py-0.5 rounded aqi-status`;
        }

        if (aqiRecommendationEl) {
            aqiRecommendationEl.textContent = aqiData.recommendation;
        }

        if (aqiCityEl) {
            aqiCityEl.textContent = aqiData.city;
        }

        if (aqiIconEl) {
            aqiIconEl.textContent = 'masks';
            aqiIconEl.classList.remove('animate-pulse');
        }

        if (aqiIndicatorEl) {
            this.updateIndicator(aqiIndicatorEl, aqiData.aqi);
        }
    },

    /**
     * Get Tailwind color class from color name
     * @param {string} color - Color name
     * @returns {string} Tailwind color class
     */
    getColorClass(color) {
        const colorMap = {
            'green': 'green',
            'yellow': 'yellow',
            'orange': 'orange',
            'red': 'red',
            'purple': 'purple',
            'maroon': 'red'
        };
        return colorMap[color] || 'gray';
    },

    /**
     * Update AQI indicator bar
     * @param {HTMLElement} element - Indicator element
     * @param {number} aqi - AQI value
     */
    updateIndicator(element, aqi) {
        const segments = [
            { max: 50, color: 'green', active: aqi <= 50 },
            { max: 100, color: 'yellow', active: aqi > 50 && aqi <= 100 },
            { max: 150, color: 'orange', active: aqi > 100 && aqi <= 150 },
            { max: 200, color: 'red', active: aqi > 150 && aqi <= 200 },
            { max: 500, color: 'purple', active: aqi > 200 }
        ];

        element.innerHTML = '';
        segments.forEach((segment, index) => {
            const div = document.createElement('div');
            const roundedClass = index === 0 ? 'rounded-l-full' : (index === 4 ? 'rounded-r-full' : '');
            if (segment.active) {
                div.className = `bg-${segment.color}-400 ${roundedClass} transform scale-y-150 rounded-sm shadow-sm`;
            } else {
                div.className = `bg-${segment.color}-400 ${roundedClass} opacity-30`;
            }
            element.appendChild(div);
        });
    },

    /**
     * Get current AQI data
     * @returns {object|null} Current AQI data
     */
    getAQI() {
        return this.currentAQI;
    }
};

/**
 * Global function to refresh air quality data
 * Called from the refresh button in the UI
 */
async function refreshAirQuality() {
    console.log('Refresh button clicked - reloading AQI data');

    // Check if location is available
    if (LocationService && LocationService.hasLocation()) {
        const location = LocationService.getLocation();
        console.log('Reloading AQI for location:', location);

        if (location && location.latitude && location.longitude) {
            await AQIService.fetchAQI(location.latitude, location.longitude);
        } else {
            console.warn('Location data incomplete, requesting new location');
            // Request fresh location
            try {
                const result = await LocationService.requestLocation();
                if (result.success && result.location) {
                    await AQIService.fetchAQI(result.location.latitude, result.location.longitude);
                }
            } catch (error) {
                console.error('Failed to get location for AQI refresh:', error);
            }
        }
    } else {
        console.warn('No location available, requesting location');
        // Request location first
        try {
            const result = await LocationService.requestLocation();
            if (result.success && result.location) {
                await AQIService.fetchAQI(result.location.latitude, result.location.longitude);
            }
        } catch (error) {
            console.error('Failed to get location for AQI refresh:', error);
        }
    }
}

// Initialize on load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        AQIService.init();
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AQIService;
}
