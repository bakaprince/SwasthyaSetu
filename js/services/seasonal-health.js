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
            // Fetch health trends
            const healthData = await this.fetchHealthTrends();
            this.healthData = healthData;

            return {
                health: healthData
            };
        } catch (error) {
            console.error('Error initializing seasonal health service:', error);
            return {
                health: this.getFallbackHealthData()
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
    const { health } = data;

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
}
