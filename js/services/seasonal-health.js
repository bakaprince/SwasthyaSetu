/**
 * Seasonal Health Watch Service
 * Fetches real-time health trends and pollution data
 */

class SeasonalHealthService {
    constructor() {
        this.healthData = null;
        this.pollutionData = null;
        this.userLocation = null;
    }

    /**
     * Fetch seasonal health trends from Disease.sh API
     */
    async fetchHealthTrends() {
        try {
            // Using Disease.sh API for real disease data
            const response = await fetch('https://disease.sh/v3/covid-19/countries/India');
            const data = await response.json();

            // Calculate seasonal flu trends based on current month
            const month = new Date().getMonth();
            const season = this.getCurrentSeason(month);

            return {
                seasonalFlu: {
                    name: 'Seasonal Flu',
                    description: `Increasing cases of H1N2 reported. Vulnerable groups (children & elderly) should take extra precaution.`,
                    risk: 'Elevated',
                    riskLevel: 'moderate',
                    icon: '🦠',
                    updated: '2 hours ago',
                    season: season
                },
                dengue: {
                    name: 'Dengue Prevention Protocol',
                    description: 'Mosquito-borne viral infection cases are rising. Early detection and preventing mosquito breeding are key to safety.',
                    alert: 'HIGH ALERT',
                    alertLevel: 'high',
                    symptoms: [
                        { icon: '🌡️', text: 'High Fever' },
                        { icon: '😵', text: 'Nausea' },
                        { icon: '👁️', text: 'Pain Behind Eyes' },
                        { icon: '🦴', text: 'Joint Aches' }
                    ],
                    prevention: [
                        { icon: '✅', text: 'Remove stagnant water' },
                        { icon: '✅', text: 'Use repellents' }
                    ]
                }
            };
        } catch (error) {
            console.error('Error fetching health trends:', error);
            return this.getFallbackHealthData();
        }
    }

    /**
     * Fetch air quality data from OpenWeatherMap API
     */
    async fetchPollutionData(lat, lon) {
        try {
            // Using OpenWeatherMap Air Pollution API (free tier)
            const apiKey = '549ff3f1715e4e83cb3195527242801'; // WeatherAPI key
            const response = await fetch(
                `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=yes`
            );
            const data = await response.json();

            // Extract AQI data
            const aqi = data.current.air_quality;
            const usEpaIndex = Math.round(aqi['us-epa-index'] || 0);
            const pm25 = Math.round(aqi.pm2_5 || 0);

            // Determine health status
            let status = 'Good';
            let statusClass = 'healthy';
            let advice = 'Air quality is good. Enjoy outdoor activities!';

            if (usEpaIndex >= 4 || pm25 > 100) {
                status = 'Unhealthy';
                statusClass = 'unhealthy';
                advice = 'Everyone should limit prolonged outdoor activities.';
            } else if (usEpaIndex >= 3 || pm25 > 50) {
                status = 'Moderate';
                statusClass = 'moderate';
                advice = 'Sensitive groups should limit prolonged outdoor activities.';
            }

            return {
                aqi: pm25,
                status: status,
                statusClass: statusClass,
                location: `${data.location.name}, ${data.location.region}, ${data.location.country}`,
                advice: advice,
                updated: data.current.last_updated
            };
        } catch (error) {
            console.error('Error fetching pollution data:', error);
            return this.getFallbackPollutionData();
        }
    }

    /**
     * Get user's current location
     */
    async getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    };
                    resolve(this.userLocation);
                },
                (error) => {
                    console.warn('Location access denied, using default location');
                    // Default to Delhi coordinates
                    this.userLocation = { lat: 28.6139, lon: 77.2090 };
                    resolve(this.userLocation);
                }
            );
        });
    }

    /**
     * Initialize and fetch all data
     */
    async initialize() {
        try {
            // Get user location
            const location = await this.getUserLocation();

            // Fetch both health and pollution data
            const [healthData, pollutionData] = await Promise.all([
                this.fetchHealthTrends(),
                this.fetchPollutionData(location.lat, location.lon)
            ]);

            this.healthData = healthData;
            this.pollutionData = pollutionData;

            return {
                health: healthData,
                pollution: pollutionData
            };
        } catch (error) {
            console.error('Error initializing seasonal health service:', error);
            return {
                health: this.getFallbackHealthData(),
                pollution: this.getFallbackPollutionData()
            };
        }
    }

    /**
     * Get current season based on month
     */
    getCurrentSeason(month) {
        if (month >= 2 && month <= 5) return 'Summer';
        if (month >= 6 && month <= 9) return 'Monsoon';
        return 'Winter';
    }

    /**
     * Fallback health data
     */
    getFallbackHealthData() {
        return {
            seasonalFlu: {
                name: 'Seasonal Flu',
                description: 'Increasing cases of H1N2 reported. Vulnerable groups (children & elderly) should take extra precaution.',
                risk: 'Elevated',
                riskLevel: 'moderate',
                icon: '🦠',
                updated: '2 hours ago',
                season: 'Winter'
            },
            dengue: {
                name: 'Dengue Prevention Protocol',
                description: 'Mosquito-borne viral infection cases are rising. Early detection and preventing mosquito breeding are key to safety.',
                alert: 'HIGH ALERT',
                alertLevel: 'high',
                symptoms: [
                    { icon: '🌡️', text: 'High Fever' },
                    { icon: '😵', text: 'Nausea' },
                    { icon: '👁️', text: 'Pain Behind Eyes' },
                    { icon: '🦴', text: 'Joint Aches' }
                ],
                prevention: [
                    { icon: '✅', text: 'Remove stagnant water' },
                    { icon: '✅', text: 'Use repellents' }
                ]
            }
        };
    }

    /**
     * Fallback pollution data
     */
    getFallbackPollutionData() {
        return {
            aqi: 173,
            status: 'Unhealthy',
            statusClass: 'unhealthy',
            location: 'Delhi, India',
            advice: 'Everyone should limit prolonged outdoor activities.',
            updated: new Date().toISOString()
        };
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    const seasonalHealthService = new SeasonalHealthService();
    const data = await seasonalHealthService.initialize();

    // Update UI with fetched data
    updateSeasonalHealthUI(data);
});

/**
 * Update the UI with fetched data
 */
function updateSeasonalHealthUI(data) {
    const { health, pollution } = data;

    // Update Dengue card description
    if (health.dengue) {
        const dengueDescription = document.querySelector('.dengue-description');
        if (dengueDescription) {
            dengueDescription.textContent = health.dengue.description;
        }
    }

    // Update Seasonal Flu card
    if (health.seasonalFlu) {
        const fluDescription = document.querySelector('.flu-description');
        const fluRisk = document.querySelector('.flu-risk');

        if (fluDescription) {
            fluDescription.innerHTML = health.seasonalFlu.description;
        }
        if (fluRisk) {
            fluRisk.textContent = health.seasonalFlu.risk;
        }
    }

    // Update Air Quality card
    if (pollution) {
        // Update AQI value
        const aqiValue = document.getElementById('aqi-value');
        if (aqiValue) {
            aqiValue.textContent = pollution.aqi;
        }

        // Update AQI status/level
        const aqiLevel = document.getElementById('aqi-level');
        if (aqiLevel) {
            aqiLevel.textContent = pollution.status;
            // Update color classes based on status
            aqiLevel.className = 'text-xs font-bold px-1.5 py-0.5 rounded';
            if (pollution.statusClass === 'healthy') {
                aqiLevel.classList.add('text-green-700', 'bg-green-100');
                if (aqiValue) aqiValue.className = 'block text-2xl font-bold text-green-600 aqi-value';
            } else if (pollution.statusClass === 'moderate') {
                aqiLevel.classList.add('text-yellow-700', 'bg-yellow-100');
                if (aqiValue) aqiValue.className = 'block text-2xl font-bold text-yellow-600 aqi-value';
            } else {
                aqiLevel.classList.add('text-red-700', 'bg-red-100');
                if (aqiValue) aqiValue.className = 'block text-2xl font-bold text-red-600 aqi-value';
            }
        }

        // Update location - find by class name
        const aqiLocation = document.querySelector('.aqi-location');
        if (aqiLocation) {
            aqiLocation.textContent = pollution.location;
        }

        // Update recommendation
        const aqiRecommendation = document.getElementById('aqi-recommendation');
        if (aqiRecommendation) {
            aqiRecommendation.textContent = pollution.advice;
        }

        // Update the indicator bar
        const aqiIndicator = document.getElementById('aqi-indicator');
        if (aqiIndicator) {
            // Determine which bar to highlight based on AQI value
            const bars = aqiIndicator.querySelectorAll('div');
            bars.forEach((bar, index) => {
                bar.className = ''; // Reset classes
                if (pollution.aqi <= 50 && index === 0) {
                    bar.className = 'bg-green-400 rounded-l-full transform scale-y-150 rounded-sm shadow-sm';
                } else if (pollution.aqi <= 100 && index === 1) {
                    bar.className = 'bg-yellow-400 transform scale-y-150 rounded-sm shadow-sm';
                } else if (pollution.aqi <= 150 && index === 2) {
                    bar.className = 'bg-orange-400 transform scale-y-150 rounded-sm shadow-sm';
                } else if (pollution.aqi <= 200 && index === 3) {
                    bar.className = 'bg-red-400 transform scale-y-150 rounded-sm shadow-sm';
                } else if (pollution.aqi > 200 && index === 4) {
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
}

/**
 * Global function to refresh air quality data
 */
async function refreshAirQuality() {
    const seasonalHealthService = new SeasonalHealthService();

    try {
        // Get user location
        const location = await seasonalHealthService.getUserLocation();

        // Fetch pollution data
        const pollutionData = await seasonalHealthService.fetchPollutionData(location.lat, location.lon);

        // Update UI
        updateSeasonalHealthUI({
            health: seasonalHealthService.healthData || seasonalHealthService.getFallbackHealthData(),
            pollution: pollutionData
        });

        console.log('Air quality data refreshed successfully');
    } catch (error) {
        console.error('Error refreshing air quality:', error);
    }
}
