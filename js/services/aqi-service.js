/**
 * Air Quality Index (AQI) Service
 * Fetches real-time air quality data based on user's geolocation
 */

class AQIService {
    constructor() {
        this.apiKey = '6d055e39ee0a4761a5d3323043e8e0e7'; // WeatherAPI key
        this.baseUrl = 'https://api.weatherapi.com/v1';
        this.currentData = null;
    }

    /**
     * Get user's current location
     */
    async getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    console.warn('Geolocation error:', error.message);
                    // Fallback to IP-based location
                    resolve(this.getLocationByIP());
                },
                {
                    enableHighAccuracy: false,
                    timeout: 5000,
                    maximumAge: 300000 // Cache for 5 minutes
                }
            );
        });
    }

    /**
     * Fallback: Get location by IP address
     */
    async getLocationByIP() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            return {
                lat: data.latitude,
                lon: data.longitude,
                city: data.city,
                country: data.country_name
            };
        } catch (error) {
            console.error('IP location error:', error);
            // Ultimate fallback to Delhi, India
            return {
                lat: 28.6139,
                lon: 77.2090,
                city: 'Delhi',
                country: 'India'
            };
        }
    }

    /**
     * Fetch air quality data from WeatherAPI
     */
    async fetchAQIData(lat, lon) {
        try {
            const url = `${this.baseUrl}/current.json?key=${this.apiKey}&q=${lat},${lon}&aqi=yes`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return this.parseAQIData(data);
        } catch (error) {
            console.error('Error fetching AQI data:', error);
            throw error;
        }
    }

    /**
     * Parse and normalize AQI data
     */
    parseAQIData(data) {
        const aqi = data.current.air_quality;
        const location = data.location;

        // WeatherAPI provides US EPA index
        const usEpaIndex = Math.round(aqi['us-epa-index'] || aqi.pm2_5 || 0);

        // Determine status and class
        let status, statusClass, advice;

        if (usEpaIndex <= 50) {
            status = 'Good';
            statusClass = 'healthy';
            advice = 'Air quality is satisfactory. Enjoy outdoor activities!';
        } else if (usEpaIndex <= 100) {
            status = 'Moderate';
            statusClass = 'moderate';
            advice = 'Air quality is acceptable for most people.';
        } else if (usEpaIndex <= 150) {
            status = 'Unhealthy for Sensitive Groups';
            statusClass = 'unhealthy-sensitive';
            advice = 'Sensitive groups should limit prolonged outdoor activities.';
        } else if (usEpaIndex <= 200) {
            status = 'Unhealthy';
            statusClass = 'unhealthy';
            advice = 'Everyone should limit prolonged outdoor activities.';
        } else if (usEpaIndex <= 300) {
            status = 'Very Unhealthy';
            statusClass = 'very-unhealthy';
            advice = 'Everyone should avoid prolonged outdoor activities.';
        } else {
            status = 'Hazardous';
            statusClass = 'hazardous';
            advice = 'Everyone should avoid all outdoor activities.';
        }

        this.currentData = {
            aqi: usEpaIndex,
            status: status,
            statusClass: statusClass,
            location: `${location.name}, ${location.region || location.country}`,
            city: location.name,
            country: location.country,
            advice: advice,
            pm2_5: aqi.pm2_5,
            pm10: aqi.pm10,
            o3: aqi.o3,
            no2: aqi.no2,
            so2: aqi.so2,
            co: aqi.co,
            updated: new Date().toISOString(),
            lastUpdate: data.current.last_updated
        };

        return this.currentData;
    }

    /**
     * Initialize and fetch AQI data
     */
    async initialize() {
        try {
            const location = await this.getUserLocation();
            const aqiData = await this.fetchAQIData(location.lat, location.lon);
            return aqiData;
        } catch (error) {
            console.error('AQI Service initialization error:', error);
            return this.getFallbackData();
        }
    }

    /**
     * Refresh AQI data
     */
    async refresh() {
        return this.initialize();
    }

    /**
     * Fallback data when API fails
     */
    getFallbackData() {
        return {
            aqi: 0,
            status: 'Unavailable',
            statusClass: 'unavailable',
            location: 'Location unavailable',
            city: 'Unknown',
            country: 'Unknown',
            advice: 'Unable to fetch air quality data. Please try again later.',
            updated: new Date().toISOString()
        };
    }
}

// Auto-initialize on page load
let aqiServiceInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Only initialize if AQI elements exist on the page
    if (document.getElementById('aqi-value')) {
        aqiServiceInstance = new AQIService();

        try {
            const aqiData = await aqiServiceInstance.initialize();
            updateAQIUI(aqiData);
        } catch (error) {
            console.error('Failed to initialize AQI service:', error);
            updateAQIUI(aqiServiceInstance.getFallbackData());
        }
    }
});

/**
 * Update AQI UI elements
 */
function updateAQIUI(data) {
    // Update AQI value
    const aqiValue = document.getElementById('aqi-value');
    if (aqiValue) {
        aqiValue.textContent = data.aqi || '--';
    }

    // Update AQI status/level
    const aqiLevel = document.getElementById('aqi-level');
    if (aqiLevel) {
        aqiLevel.textContent = data.status;
        // Update color classes based on status
        aqiLevel.className = 'text-xs font-bold px-1.5 py-0.5 rounded';

        if (data.statusClass === 'healthy') {
            aqiLevel.classList.add('text-green-700', 'bg-green-100');
            if (aqiValue) aqiValue.className = 'block text-2xl font-bold text-green-600 aqi-value';
        } else if (data.statusClass === 'moderate') {
            aqiLevel.classList.add('text-yellow-700', 'bg-yellow-100');
            if (aqiValue) aqiValue.className = 'block text-2xl font-bold text-yellow-600 aqi-value';
        } else if (data.statusClass === 'unhealthy-sensitive') {
            aqiLevel.classList.add('text-orange-700', 'bg-orange-100');
            if (aqiValue) aqiValue.className = 'block text-2xl font-bold text-orange-600 aqi-value';
        } else if (data.statusClass === 'unhealthy' || data.statusClass === 'very-unhealthy') {
            aqiLevel.classList.add('text-red-700', 'bg-red-100');
            if (aqiValue) aqiValue.className = 'block text-2xl font-bold text-red-600 aqi-value';
        } else if (data.statusClass === 'hazardous') {
            aqiLevel.classList.add('text-purple-700', 'bg-purple-100');
            if (aqiValue) aqiValue.className = 'block text-2xl font-bold text-purple-600 aqi-value';
        } else {
            aqiLevel.classList.add('text-gray-700', 'bg-gray-100');
            if (aqiValue) aqiValue.className = 'block text-2xl font-bold text-gray-600 aqi-value';
        }
    }

    // Update location
    const aqiCity = document.getElementById('aqi-city');
    if (aqiCity) {
        aqiCity.textContent = data.location || 'Unknown location';
    }

    // Update recommendation
    const aqiRecommendation = document.getElementById('aqi-recommendation');
    if (aqiRecommendation) {
        aqiRecommendation.textContent = data.advice;
    }

    // Update the indicator bar
    const aqiIndicator = document.getElementById('aqi-indicator');
    if (aqiIndicator) {
        const bars = aqiIndicator.querySelectorAll('div');
        bars.forEach((bar, index) => {
            bar.className = ''; // Reset classes

            const aqi = data.aqi || 0;

            if (aqi <= 50 && index === 0) {
                bar.className = 'bg-green-400 rounded-l-full transform scale-y-150 rounded-sm shadow-sm';
            } else if (aqi > 50 && aqi <= 100 && index === 1) {
                bar.className = 'bg-yellow-400 transform scale-y-150 rounded-sm shadow-sm';
            } else if (aqi > 100 && aqi <= 150 && index === 2) {
                bar.className = 'bg-orange-400 transform scale-y-150 rounded-sm shadow-sm';
            } else if (aqi > 150 && aqi <= 200 && index === 3) {
                bar.className = 'bg-red-400 transform scale-y-150 rounded-sm shadow-sm';
            } else if (aqi > 200 && index === 4) {
                bar.className = 'bg-purple-800 rounded-r-full transform scale-y-150 rounded-sm shadow-sm';
            } else {
                // Default opacity for non-active bars
                if (index === 0) bar.className = 'bg-green-400 rounded-l-full opacity-30';
                else if (index === 1) bar.className = 'bg-yellow-400 opacity-30';
                else if (index === 2) bar.className = 'bg-orange-400 opacity-30';
                else if (index === 3) bar.className = 'bg-red-400 opacity-30';
                else if (index === 4) bar.className = 'bg-purple-800 rounded-r-full opacity-30';
            }
        });
    }
}

/**
 * Global function to refresh air quality data
 */
async function refreshAirQuality() {
    if (!aqiServiceInstance) {
        aqiServiceInstance = new AQIService();
    }

    try {
        // Show loading state
        const aqiValue = document.getElementById('aqi-value');
        const aqiLevel = document.getElementById('aqi-level');
        const aqiRecommendation = document.getElementById('aqi-recommendation');

        if (aqiValue) aqiValue.textContent = '--';
        if (aqiLevel) aqiLevel.textContent = 'Refreshing...';
        if (aqiRecommendation) aqiRecommendation.textContent = 'Fetching latest air quality data...';

        // Fetch fresh data
        const aqiData = await aqiServiceInstance.refresh();
        updateAQIUI(aqiData);

        console.log('Air quality data refreshed successfully');
    } catch (error) {
        console.error('Error refreshing air quality:', error);
        updateAQIUI(aqiServiceInstance.getFallbackData());
    }
}
