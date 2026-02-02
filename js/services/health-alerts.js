/**
 * Health Alert Service
 * Handles dynamic fetching of Air Quality and Seasonal Disease alerts based on location
 */

const HealthAlertService = {
    // Default location (e.g., Delhi) if user denies permission
    defaultLocation: { lat: 28.6139, lon: 77.2090, city: 'New Delhi' },

    // API Endpoints
    aqiApiUrl: 'https://air-quality-api.open-meteo.com/v1/air-quality',
    weatherApiUrl: 'https://api.open-meteo.com/v1/forecast',
    addressApiUrl: 'https://nominatim.openstreetmap.org/reverse',

    async init() {
        const container = document.getElementById('health-alerts-container');
        if (!container) return;

        this.renderLoadingState();

        try {
            const location = await this.getUserLocation();
            const [aqiData, weatherData, address] = await Promise.all([
                this.fetchAirQuality(location.lat, location.lon),
                this.fetchWeather(location.lat, location.lon),
                this.fetchAddress(location.lat, location.lon)
            ]);

            this.renderAlerts(location, aqiData, weatherData, address);
        } catch (error) {
            console.error('Health Alert Error:', error);
            this.renderErrorState();
        }
    },

    getUserLocation() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve(this.defaultLocation);
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
                    console.warn('Geolocation denied/error, using default:', error);
                    resolve(this.defaultLocation);
                },
                { timeout: 5000 } // 5s timeout
            );
        });
    },

    async fetchAirQuality(lat, lon) {
        try {
            // Fetch US AQI and PM2.5
            const response = await fetch(`${this.aqiApiUrl}?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5`);
            const data = await response.json();
            return data.current || { us_aqi: 150, pm2_5: 55 }; // Fallback
        } catch (e) {
            console.error('AQI Fetch failed', e);
            return { us_aqi: '--', pm2_5: '--' };
        }
    },

    async fetchWeather(lat, lon) {
        try {
            const response = await fetch(`${this.weatherApiUrl}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain&timezone=auto`);
            const data = await response.json();
            return data.current || { temperature_2m: 30, relative_humidity_2m: 50, rain: 0 };
        } catch (e) {
            console.error('Weather Fetch failed', e);
            return { temperature_2m: 30, relative_humidity_2m: 50, rain: 0 };
        }
    },

    async fetchAddress(lat, lon) {
        try {
            // Simple reverse geocoding for city name display
            const response = await fetch(`${this.addressApiUrl}?format=json&lat=${lat}&lon=${lon}`);
            const data = await response.json();
            return data.address.city || data.address.town || data.address.state || 'Your Region';
        } catch (e) {
            return 'Your Region';
        }
    },

    // --- Biometeorological Risk Engine ---
    getBiometeorologicalRisk(weather) {
        const { temperature_2m: temp, relative_humidity_2m: humidity, rain } = weather;

        let highAlert = null;
        let primaryRisk = null;

        // Logic 1: Dengue / Mosquito Risk (High Humidity + Warm + Rain)
        if (humidity > 60 && temp > 22 && temp < 35) {
            highAlert = {
                title: 'Dengue Prediction <br/>Model',
                type: 'Vector-Borne Risk',
                desc: `Current weather (${temp}°C, ${humidity}% Humidity) favors rapid mosquito breeding. Eliminate stagnant water immediately.`,
                symptoms: ['High Fever', 'Pain Behind Eyes', 'Joint Aches', 'Nausea'],
                updated: 'Live Prediction',
                color: 'red'
            };
        }
        // Logic 2: Heatwave (High Temp)
        else if (temp > 38) {
            highAlert = {
                title: 'Heatwave <br/>Warning',
                type: 'Extreme Heat',
                desc: `Dangerous temperatures (${temp}°C) detected. Risk of heatstroke is high. Stay hydrated.`,
                symptoms: ['Dizziness', 'Dehydration', 'Cramps', 'Headache'],
                updated: 'Live Prediction',
                color: 'red'
            };
        }
        // Logic 3: Cold Wave / Flu (Low Temp)
        else if (temp < 15) {
            highAlert = {
                title: 'Cold Wave & <br/>Flu Alert',
                type: 'Viral Risk',
                desc: `Low temperatures (${temp}°C) may trigger respiratory issues and flu spikes. Keep warm.`,
                symptoms: ['Runny Nose', 'Sore Throat', 'Fever', 'Chills'],
                updated: 'Live Prediction',
                color: 'orange'
            };
        }
        // Default: General Viral/Seasonal
        else {
            highAlert = {
                title: 'Seasonal Viral <br/>Watch',
                type: 'Standard Monitoring',
                desc: `Current weather is stable, but seasonal viral infections are common. Maintain hygiene.`,
                symptoms: ['Mild Fever', 'Cough', 'Body Ache', 'Fatigue'],
                updated: 'Live Prediction',
                color: 'blue'
            };
        }

        // Secondary Risk Logic
        if (rain > 1) {
            primaryRisk = {
                id: 'water-borne',
                title: 'Water-Borne Illness',
                subtitle: 'Cholera / Typhoid Risk',
                level: 'Elevated',
                levelColor: 'text-orange-600 bg-orange-100',
                spreadRisk: 70,
                desc: 'Recent rainfall detected. Risk of water contamination is elevated. Boil water before drinking.',
                symptoms: ['Stomach Pain', 'Vomiting', 'Diarrhea'],
                icon: 'water_drop'
            };
        } else {
            primaryRisk = {
                id: 'seasonal-flu',
                title: 'Common Flu',
                subtitle: 'Viral Infection',
                level: 'Moderate',
                levelColor: 'text-yellow-600 bg-yellow-100',
                spreadRisk: 40,
                desc: 'Standard seasonal viral activity calculated based on current atmospheric conditions.',
                symptoms: ['Fever', 'Cough', 'Fatigue'],
                icon: 'masks'
            };
        }

        return { highAlert, primaryRisk };
    },

    getAqiStatus(aqi) {
        if (aqi <= 50) return { label: 'Good', color: 'text-green-500', bar: 'bg-green-500', width: '20%' };
        if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-500', bar: 'bg-yellow-500', width: '40%' };
        if (aqi <= 150) return { label: 'Unhealthy (Group)', color: 'text-orange-500', bar: 'bg-orange-500', width: '60%' };
        if (aqi <= 200) return { label: 'Unhealthy', color: 'text-red-500', bar: 'bg-red-500', width: '80%' };
        return { label: 'Hazardous', color: 'text-purple-600', bar: 'bg-purple-600', width: '100%' };
    },

    renderAlerts(location, aqiData, weatherData, cityName) {
        const container = document.getElementById('health-alerts-container');
        const { highAlert, primaryRisk } = this.getBiometeorologicalRisk(weatherData);
        const aqiStatus = this.getAqiStatus(aqiData.us_aqi);

        // -- 1. High Alert Card Template --
        const highAlertCard = `
            <div class="lg:col-span-7 bg-white dark:bg-secondary-light rounded-3xl hover:shadow-xl transition-all duration-300 overflow-hidden border border-indigo-100 dark:border-gray-700 flex flex-col group h-full">
                <div class="bg-indigo-50 dark:bg-gray-800/50 p-8 flex-grow relative overflow-hidden">
                    <!-- Background Blobs -->
                    <div class="absolute -right-16 -top-16 w-64 h-64 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-2xl"></div>
                    <div class="absolute left-10 bottom-10 w-32 h-32 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-xl"></div>

                    <div class="relative z-10 h-full flex flex-col">
                        <div class="flex items-center gap-3 mb-6">
                            <span class="bg-${highAlert.color === 'red' ? 'red' : 'blue'}-100 text-${highAlert.color === 'red' ? 'red' : 'blue'}-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                <span class="w-2 h-2 bg-${highAlert.color === 'red' ? 'red' : 'blue'}-500 rounded-full animate-pulse"></span> ${highAlert.type}
                            </span>
                            <span class="text-indigo-600 dark:text-indigo-300 font-medium text-sm">Updated: ${highAlert.updated}</span>
                        </div>

                        <div class="flex flex-col md:flex-row gap-8 items-start flex-1">
                            <div class="flex-1">
                                <h3 class="font-display text-3xl md:text-4xl font-bold text-secondary dark:text-white mb-4 leading-tight">
                                    ${highAlert.title}
                                </h3>
                                <p class="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                    ${highAlert.desc}
                                </p>
                                <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-indigo-50 dark:border-gray-700">
                                    <h4 class="font-bold text-secondary dark:text-white text-sm mb-3 flex items-center gap-2">
                                        <span class="material-icons-outlined text-orange-500">warning</span> Common Symptoms
                                    </h4>
                                    <div class="grid grid-cols-2 gap-3">
                                        ${highAlert.symptoms.map(s => `
                                            <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <div class="w-8 h-8 rounded-full bg-red-50 dark:bg-gray-700 flex items-center justify-center text-red-500 shrink-0">
                                                    <span class="material-icons-outlined text-sm">thermostat</span>
                                                </div>
                                                ${s}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                            <!-- Dynamic Icon/Illustration -->
                            <div class="hidden md:flex flex-col items-center justify-center w-48 shrink-0 self-center">
                                <div class="w-32 h-32 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center relative mb-4">
                                    <span class="material-icons-outlined text-6xl text-${highAlert.color === 'red' ? 'red' : 'blue'}-500">
                                        ${highAlert.color === 'red' ? 'emergency' : 'verified_user'}
                                    </span>
                                    ${highAlert.color === 'red' ? `<div class="absolute -top-2 -right-2 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center animate-bounce"><span class="material-icons-outlined text-red-500">priority_high</span></div>` : ''}
                                </div>
                                <button class="w-full py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-secondary dark:text-white text-sm font-bold rounded-xl border border-gray-200 dark:border-gray-600 transition-colors shadow-sm">
                                    Check Guidelines &rarr;
                                </button>
                            </div>
                        </div>
                    </div>
                    <!-- Disclaimer -->
                    <div class="mt-4 pt-4 border-t border-indigo-100 dark:border-gray-700 text-[10px] text-gray-400 text-center">
                        * Health alerts are predictive estimates based on real-time local weather data (Open-Meteo) and may not reflect official clinical case counts.
                    </div>
                </div>
            </div>
        `;

        // -- 2. Secondary Risk Card --
        const riskCard = `
            <div class="lg:col-span-12 xl:col-span-5 flex flex-col gap-6">
                <!-- Secondary Disease Card -->
                <div class="bg-amber-50 dark:bg-gray-800/50 rounded-3xl p-6 border border-amber-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div class="absolute right-0 top-0 w-32 h-32 bg-orange-100 dark:bg-orange-900/20 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>

                    <div class="flex justify-between items-start mb-4">
                        <div class="flex gap-4">
                            <div class="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm text-orange-500">
                                <span class="material-icons-outlined text-2xl">${primaryRisk.icon}</span>
                            </div>
                            <div>
                                <h3 class="font-bold text-xl text-secondary dark:text-white">${primaryRisk.title}</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400">${primaryRisk.subtitle}</p>
                            </div>
                        </div>
                        <span class="${primaryRisk.levelColor} px-3 py-1 rounded-full text-xs font-bold uppercase">${primaryRisk.level}</span>
                    </div>

                    <p class="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                        ${primaryRisk.desc}
                    </p>

                    <div class="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 mb-4 backdrop-blur-sm">
                        <div class="flex justify-between text-xs font-bold text-gray-500 uppercase mb-2">
                            <span>Spread Risk</span>
                            <span class="text-orange-600">${primaryRisk.spreadRisk > 50 ? 'Elevated' : 'Low'}</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div class="bg-orange-500 h-2 rounded-full transition-all duration-1000" style="width: ${primaryRisk.spreadRisk}%"></div>
                        </div>
                    </div>

                    <div class="flex gap-3">
                        <button class="flex-1 py-2.5 bg-white dark:bg-gray-800 text-secondary dark:text-white text-sm font-bold rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all">
                            Find Clinic
                        </button>
                        <button class="flex-1 py-2.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-bold rounded-xl hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors">
                            More Info
                        </button>
                    </div>
                </div>

                <!-- AQI Card -->
                <div class="bg-white dark:bg-secondary-light rounded-3xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all flex flex-col justify-between flex-1">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-blue-50 dark:bg-gray-700 rounded-full flex items-center justify-center text-blue-500">
                                <span class="material-icons-outlined">air</span>
                            </div>
                            <div>
                                <h3 class="font-bold text-lg text-secondary dark:text-white">Air Quality</h3>
                                <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <span class="material-icons-outlined text-[10px]">location_on</span> ${cityName}
                                </p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="block text-3xl font-bold ${aqiStatus.color}">${aqiData.us_aqi}</span>
                            <span class="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500 uppercase font-bold">US AQI</span>
                        </div>
                    </div>

                    <div>
                        <div class="flex justify-between items-end mb-2">
                            <span class="text-sm font-medium ${aqiStatus.color}">${aqiStatus.label}</span>
                            <span class="text-xs text-gray-400">PM2.5: ${aqiData.pm2_5} µg/m³</span>
                        </div>
                        <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 p-0.5">
                            <div class="${aqiStatus.bar} h-2 rounded-full transition-all duration-1000 shadow-sm" style="width: ${aqiStatus.width}"></div>
                        </div>
                        <p class="text-xs text-gray-500 mt-3 flex items-start gap-1">
                            <span class="material-icons-outlined text-[12px] mt-0.5">verified_user</span>
                            Sensitive groups should limit prolonged outdoor activities.
                        </p>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = highAlertCard + riskCard;
        container.classList.remove('hidden');
        document.getElementById('health-alerts-loading').remove();
    },

    renderLoadingState() {
        const container = document.getElementById('health-alerts-container');
        if (container) return; // Prevent double render

        const section = document.querySelector('#health-alerts-container').parentElement; // The section wrapper

        const loader = `
            <div id="health-alerts-loading" class="flex flex-col items-center justify-center py-20 gap-4">
                <div class="w-12 h-12 border-4 border-gray-200 border-t-teal-600 rounded-full animate-spin"></div>
                <p class="text-gray-500 font-medium">Analyzing local health data...</p>
            </div>
        `;
        document.getElementById('health-alerts-container').insertAdjacentHTML('beforebegin', loader);
        document.getElementById('health-alerts-container').classList.add('hidden');
    },

    renderErrorState() {
        const container = document.getElementById('health-alerts-container');
        container.innerHTML = `<div class="col-span-12 text-center py-10 text-gray-500">Unable to load local health alerts. Please check your connection.</div>`;
        container.classList.remove('hidden');
        const loader = document.getElementById('health-alerts-loading');
        if (loader) loader.remove();
    }
};

// Export for usage
window.HealthAlertService = HealthAlertService;
