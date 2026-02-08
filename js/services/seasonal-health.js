/**
 * Seasonal Health Watch Service
 * AI-powered health risk predictions based on weather, geography, and seasonal patterns
 */

class SeasonalHealthService {
    constructor() {
        this.healthData = null;
        this.weatherData = null;
        this.userLocation = null;
        this.apiKey = '6d055e39ee0a4761a5d3323043e8e0e7'; // WeatherAPI key
    }

    /**
     * Fetch weather data for location
     */
    async fetchWeatherData(lat, lon) {
        try {
            const response = await fetch(
                `https://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=${lat},${lon}&aqi=no`
            );
            const data = await response.json();

            return {
                temp_c: data.current.temp_c,
                humidity: data.current.humidity,
                condition: data.current.condition.text,
                precip_mm: data.current.precip_mm,
                feelslike_c: data.current.feelslike_c,
                location: {
                    name: data.location.name,
                    region: data.location.region,
                    country: data.location.country,
                    lat: data.location.lat,
                    lon: data.location.lon
                }
            };
        } catch (error) {
            console.error('Error fetching weather data:', error);
            return null;
        }
    }

    /**
     * Predict Dengue risk based on weather and geography
     */
    predictDengueRisk(weather, month) {
        if (!weather) return this.getDefaultDengueData();

        const temp = weather.temp_c;
        const humidity = weather.humidity;
        const region = weather.location.region;

        // Dengue mosquitoes thrive in 25-35°C with high humidity
        let riskScore = 0;
        let riskLevel = 'low';
        let alertLevel = 'low';
        let description = '';

        // Temperature factor (optimal: 25-35°C)
        if (temp >= 25 && temp <= 35) {
            riskScore += 40;
        } else if (temp >= 20 && temp < 25) {
            riskScore += 20;
        } else if (temp > 35 && temp <= 40) {
            riskScore += 15;
        }

        // Humidity factor (high humidity increases risk)
        if (humidity >= 70) {
            riskScore += 30;
        } else if (humidity >= 50) {
            riskScore += 15;
        }

        // Monsoon season (June-September) increases risk
        if (month >= 5 && month <= 8) {
            riskScore += 20;
        }

        // Post-monsoon (October-November) also high risk
        if (month >= 9 && month <= 10) {
            riskScore += 15;
        }

        // Recent precipitation increases breeding sites
        if (weather.precip_mm > 0) {
            riskScore += 10;
        }

        // Determine risk level and alert
        if (riskScore >= 70) {
            riskLevel = 'very-high';
            alertLevel = 'high';
            description = `⚠️ Very High Dengue Risk predicted for ${weather.location.name}. Temperature (${temp.toFixed(1)}°C) and humidity (${humidity}%) create ideal breeding conditions. Remove all stagnant water immediately and use mosquito repellents.`;
        } else if (riskScore >= 50) {
            riskLevel = 'high';
            alertLevel = 'high';
            description = `High Dengue Risk predicted. Current conditions (${temp.toFixed(1)}°C, ${humidity}% humidity) favor mosquito breeding. Take preventive measures seriously.`;
        } else if (riskScore >= 30) {
            riskLevel = 'moderate';
            alertLevel = 'moderate';
            description = `Moderate Dengue Risk. Weather conditions (${temp.toFixed(1)}°C, ${humidity}% humidity) may support mosquito activity. Stay vigilant and maintain hygiene.`;
        } else {
            riskLevel = 'low';
            alertLevel = 'low';
            description = `Low Dengue Risk currently. Weather conditions (${temp.toFixed(1)}°C, ${humidity}% humidity) are less favorable for mosquito breeding, but continue basic precautions.`;
        }

        return {
            name: 'Dengue Prevention Protocol',
            description: description,
            alert: alertLevel === 'high' ? 'HIGH ALERT' : alertLevel === 'moderate' ? 'MODERATE ALERT' : 'LOW RISK',
            alertLevel: alertLevel,
            riskScore: riskScore,
            riskLevel: riskLevel,
            factors: {
                temperature: temp,
                humidity: humidity,
                season: this.getCurrentSeason(month),
                precipitation: weather.precip_mm
            },
            symptoms: [
                { icon: '🌡️', text: 'High Fever' },
                { icon: '😵', text: 'Nausea' },
                { icon: '👁️', text: 'Pain Behind Eyes' },
                { icon: '🦴', text: 'Joint Aches' }
            ],
            prevention: [
                { icon: '✅', text: 'Remove stagnant water' },
                { icon: '✅', text: 'Use repellents' }
            ],
            isPrediction: true
        };
    }

    /**
     * Predict Seasonal Flu risk based on weather and season
     */
    predictFluRisk(weather, month) {
        if (!weather) return this.getDefaultFluData();

        const temp = weather.temp_c;
        const humidity = weather.humidity;
        const feelsLike = weather.feelslike_c;

        // Flu spreads more in cold, dry conditions
        let riskScore = 0;
        let riskLevel = 'low';
        let description = '';

        // Temperature factor (cold weather increases risk)
        if (temp <= 15) {
            riskScore += 40;
        } else if (temp <= 25) {
            riskScore += 20;
        }

        // Low humidity increases flu transmission
        if (humidity < 40) {
            riskScore += 30;
        } else if (humidity < 60) {
            riskScore += 15;
        }

        // Winter months (November-February) peak season
        if (month >= 10 || month <= 1) {
            riskScore += 25;
        }

        // Transition months (March, October)
        if (month === 2 || month === 9) {
            riskScore += 15;
        }

        // Determine risk level
        if (riskScore >= 70) {
            riskLevel = 'very-high';
            description = `⚠️ Very High Flu Risk predicted for ${weather.location.name}. Cold temperature (${temp.toFixed(1)}°C) and low humidity (${humidity}%) create ideal conditions for flu spread. Vulnerable groups should get vaccinated and avoid crowded places.`;
        } else if (riskScore >= 50) {
            riskLevel = 'high';
            description = `High Flu Risk predicted. Current conditions (${temp.toFixed(1)}°C, ${humidity}% humidity) favor flu transmission. Children and elderly should take extra precautions.`;
        } else if (riskScore >= 30) {
            riskLevel = 'moderate';
            description = `Moderate Flu Risk. Weather conditions (${temp.toFixed(1)}°C, ${humidity}% humidity) may support flu activity. Maintain good hygiene and consider vaccination.`;
        } else {
            riskLevel = 'low';
            description = `Low Flu Risk currently. Weather conditions (${temp.toFixed(1)}°C, ${humidity}% humidity) are less favorable for flu spread, but continue basic hygiene practices.`;
        }

        // Map risk level to spread risk text
        let spreadRisk = 'Low';
        if (riskLevel === 'very-high') spreadRisk = 'Very High';
        else if (riskLevel === 'high') spreadRisk = 'Elevated';
        else if (riskLevel === 'moderate') spreadRisk = 'Moderate';

        return {
            name: 'Seasonal Flu',
            description: description,
            risk: spreadRisk,
            riskLevel: riskLevel,
            riskScore: riskScore,
            icon: '🦠',
            factors: {
                temperature: temp,
                humidity: humidity,
                feelsLike: feelsLike,
                season: this.getCurrentSeason(month)
            },
            updated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            isPrediction: true
        };
    }

    /**
     * Fetch health predictions based on location
     */
    async fetchHealthTrends() {
        try {
            // Get location from LocationService
            let lat, lon;
            if (typeof LocationService !== 'undefined' && LocationService.hasLocation()) {
                const location = LocationService.getLocation();
                lat = location.latitude;
                lon = location.longitude;
            } else {
                // Fallback to Delhi
                lat = 28.6139;
                lon = 77.2090;
            }

            // Fetch weather data
            const weather = await this.fetchWeatherData(lat, lon);
            this.weatherData = weather;

            // Get current month (0-11)
            const month = new Date().getMonth();

            // Generate predictions
            const dengue = this.predictDengueRisk(weather, month);
            const seasonalFlu = this.predictFluRisk(weather, month);

            return {
                seasonalFlu: seasonalFlu,
                dengue: dengue,
                weather: weather
            };
        } catch (error) {
            console.error('Error fetching health trends:', error);
            return this.getFallbackHealthData();
        }
    }

    /**
     * Initialize and fetch all data
     */
    async initialize() {
        try {
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
     * Default dengue data
     */
    getDefaultDengueData() {
        return {
            name: 'Dengue Prevention Protocol',
            description: 'Mosquito-borne viral infection. Weather data unavailable for risk prediction.',
            alert: 'MODERATE ALERT',
            alertLevel: 'moderate',
            riskScore: 50,
            riskLevel: 'moderate',
            symptoms: [
                { icon: '🌡️', text: 'High Fever' },
                { icon: '😵', text: 'Nausea' },
                { icon: '👁️', text: 'Pain Behind Eyes' },
                { icon: '🦴', text: 'Joint Aches' }
            ],
            prevention: [
                { icon: '✅', text: 'Remove stagnant water' },
                { icon: '✅', text: 'Use repellents' }
            ],
            isPrediction: false
        };
    }

    /**
     * Default flu data
     */
    getDefaultFluData() {
        return {
            name: 'Seasonal Flu',
            description: 'Viral respiratory infection. Weather data unavailable for risk prediction.',
            risk: 'Moderate',
            riskLevel: 'moderate',
            riskScore: 50,
            icon: '🦠',
            updated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            isPrediction: false
        };
    }

    /**
     * Fallback health data
     */
    getFallbackHealthData() {
        return {
            seasonalFlu: this.getDefaultFluData(),
            dengue: this.getDefaultDengueData()
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

        // Add prediction disclaimer if it's a prediction
        if (health.dengue.isPrediction) {
            addPredictionDisclaimer('dengue');
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

        // Add prediction disclaimer if it's a prediction
        if (health.seasonalFlu.isPrediction) {
            addPredictionDisclaimer('flu');
        }
    }
}

/**
 * Add prediction disclaimer to cards
 */
function addPredictionDisclaimer(cardType) {
    const disclaimerHTML = `
        <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span class="material-icons-outlined text-sm">info</span>
                <span>AI-powered prediction based on weather, geography & seasonal patterns. Not a medical diagnosis.</span>
            </p>
        </div>
    `;

    let targetCard;
    if (cardType === 'dengue') {
        targetCard = document.querySelector('.dengue-card');
    } else if (cardType === 'flu') {
        targetCard = document.querySelector('.flu-card');
    }

    if (targetCard && !targetCard.querySelector('.border-t')) {
        targetCard.insertAdjacentHTML('beforeend', disclaimerHTML);
    }
}
