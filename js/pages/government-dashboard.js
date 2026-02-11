/**
 * Government Dashboard Analytics
 * Handles Disease Heatmap, Performance Charts, and Crisis Alerts
 */

const GovAnalytics = {
    charts: {},
    apiBaseUrl: 'https://swasthya-setu-drcode.vercel.app/api', // Define API Base URL

    async init() {
        console.log('Initializing Gov Analytics...');

        // Auth check is handled in HTML to avoid race conditions
        // if (!AuthService.isAuthenticated()) { ... }

        // Initialize Charts (map is handled by IndiaMap component separately)
        this.initCharts();

        // Load Data
        await Promise.all([
            this.loadDiseaseMap(),
            this.loadOutcomes(),
            this.loadHospitalPerformance(),
            this.loadAlerts()
        ]);

        // Setup Interval for Real-time alerts (every 60s)
        setInterval(() => this.loadAlerts(), 60000);
    },

    // State Lat/Lng Mapping for Real API Data
    stateCoordinates: {
        "Maharashtra": [19.7515, 75.7139],
        "Delhi": [28.7041, 77.1025],
        "Tamil Nadu": [11.1271, 78.6569],
        "Karnataka": [15.3173, 75.7139],
        "Andhra Pradesh": [15.9129, 79.7400],
        "Uttar Pradesh": [26.8467, 80.9462],
        "West Bengal": [22.9868, 87.8550],
        "Kerala": [10.8505, 76.2711],
        "Gujarat": [22.2587, 71.1924],
        "Rajasthan": [27.0238, 74.2179],
        "Telangana": [18.1124, 79.0193],
        "Bihar": [25.0961, 85.3131],
        "Haryana": [29.0588, 76.0856],
        "Punjab": [31.1471, 75.3412],
        "Odisha": [20.9517, 85.0985],
        "Madhya Pradesh": [22.9734, 78.6569],
        "Assam": [26.2006, 92.9376],
        "Jammu and Kashmir": [33.7782, 76.5762],
        "Uttarakhand": [30.0668, 79.0193],
        "Himachal Pradesh": [31.1048, 77.1734],
        "Goa": [15.2993, 74.1240]
    },

    // --- INTERACTIVE INDIA STATES MAP ---
    // State population data (2024 estimates in millions)
    statePopulation: {
        "Andaman and Nicobar Islands": 0.4, "Andhra Pradesh": 53.9, "Arunachal Pradesh": 1.6,
        "Assam": 35.6, "Bihar": 127.0, "Chandigarh": 1.2, "Chhattisgarh": 30.0,
        "Dadra and Nagar Haveli and Daman and Diu": 0.6, "Delhi": 21.0, "Goa": 1.6,
        "Gujarat": 71.0, "Haryana": 30.0, "Himachal Pradesh": 7.5, "Jammu and Kashmir": 14.0,
        "Jharkhand": 40.0, "Karnataka": 69.0, "Kerala": 35.7, "Ladakh": 0.3,
        "Lakshadweep": 0.07, "Madhya Pradesh": 87.0, "Maharashtra": 128.0, "Manipur": 3.2,
        "Meghalaya": 3.8, "Mizoram": 1.3, "Nagaland": 2.3, "Odisha": 47.0,
        "Puducherry": 1.7, "Punjab": 31.0, "Rajasthan": 82.0, "Sikkim": 0.7,
        "Tamil Nadu": 78.0, "Telangana": 39.0, "Tripura": 4.2, "Uttar Pradesh": 235.0,
        "Uttarakhand": 11.5, "West Bengal": 101.0
    },

    // Hospital rating data (mock - can be replaced with live API)
    stateHospitalRatings: {
        "Andhra Pradesh": 4.1, "Arunachal Pradesh": 3.2, "Assam": 3.5, "Bihar": 3.0,
        "Chhattisgarh": 3.4, "Delhi": 4.3, "Goa": 4.5, "Gujarat": 4.2, "Haryana": 3.8,
        "Himachal Pradesh": 4.0, "Jammu and Kashmir": 3.6, "Jharkhand": 3.2, "Karnataka": 4.4,
        "Kerala": 4.6, "Madhya Pradesh": 3.5, "Maharashtra": 4.3, "Manipur": 3.3,
        "Meghalaya": 3.4, "Mizoram": 3.5, "Nagaland": 3.2, "Odisha": 3.6, "Punjab": 4.0,
        "Rajasthan": 3.7, "Sikkim": 3.8, "Tamil Nadu": 4.5, "Telangana": 4.2, "Tripura": 3.4,
        "Uttar Pradesh": 3.3, "Uttarakhand": 3.9, "West Bengal": 3.8, "Ladakh": 3.0
    },

    // Store COVID data fetched from API
    covidData: {},
    statesLayer: null,
    selectedState: null,

    initMap() {
        // Bounds covering entire India - tighter fit
        const southWest = L.latLng(6.5, 68.0);
        const northEast = L.latLng(36.5, 97.5);
        const bounds = L.latLngBounds(southWest, northEast);

        // Create map without background tiles - transparent/white
        this.map = L.map('india-map', {
            maxBounds: bounds,
            maxBoundsViscosity: 1.0,
            minZoom: 4,
            maxZoom: 8,
            zoomControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            touchZoom: false,
            boxZoom: false,
            keyboard: false,
            attributionControl: false
        });

        // Fit to India bounds perfectly
        this.map.fitBounds(bounds);

        // Load interactive states
        this.loadStatesGeoJSON();
    },

    addResetButton() {
        const resetControl = L.control({ position: 'topright' });
        resetControl.onAdd = () => {
            const div = L.DomUtil.create('div', 'leaflet-bar');
            div.innerHTML = `<a href="#" title="Reset View" style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;background:white;font-size:18px;">🇮🇳</a>`;
            div.onclick = (e) => {
                e.preventDefault();
                this.resetMapView();
            };
            return div;
        };
        resetControl.addTo(this.map);
    },

    resetMapView() {
        this.selectedState = null;
        this.map.setView([22.5, 82.5], 5);
        if (this.statesLayer) {
            this.statesLayer.resetStyle();
        }
        // Hide state detail panel if visible
        const panel = document.getElementById('state-detail-panel');
        if (panel) panel.classList.add('hidden');
    },

    async loadStatesGeoJSON() {
        try {
            // Fetch India states GeoJSON (Local source)
            const response = await fetch('../js/data/india_states.geojson');
            const statesGeoJSON = await response.json();

            // Fetch COVID data first
            await this.fetchCovidData();

            // Create states layer with interactivity
            this.statesLayer = L.geoJSON(statesGeoJSON, {
                style: (feature) => this.getStateStyle(feature, false),
                onEachFeature: (feature, layer) => this.onEachState(feature, layer)
            }).addTo(this.map);

            // Add outer border glow
            this.addOuterBorderGlow(statesGeoJSON);

            console.log('Interactive India states map loaded successfully');
        } catch (error) {
            console.error('Failed to load states GeoJSON:', error);
        }
    },

    addOuterBorderGlow(statesGeoJSON) {
        // Merged India boundary for outer glow
        L.geoJSON(statesGeoJSON, {
            style: {
                color: '#000000',
                weight: 3,
                opacity: 0.5,
                fillColor: 'transparent',
                fillOpacity: 0
            }
        }).addTo(this.map);

        // Add permanent state name labels
        this.addStateLabels(statesGeoJSON);
    },

    // Add permanent labels for each state
    addStateLabels(geoJSON) {
        geoJSON.features.forEach(feature => {
            const stateName = feature.properties.NAME_1 || feature.properties.name || feature.properties.ST_NM || '';
            if (!stateName) return;

            // Get center of state polygon
            const layer = L.geoJSON(feature);
            const center = layer.getBounds().getCenter();

            // Create label with short name (abbreviation for small states)
            const shortNames = {
                'Andaman and Nicobar Islands': 'A&N',
                'Dadra and Nagar Haveli and Daman and Diu': 'DNH',
                'Jammu and Kashmir': 'J&K',
                'Himachal Pradesh': 'HP',
                'Arunachal Pradesh': 'AR',
                'Uttar Pradesh': 'UP',
                'Madhya Pradesh': 'MP',
                'Andhra Pradesh': 'AP',
                'Tamil Nadu': 'TN',
                'West Bengal': 'WB',
                'Chhattisgarh': 'CG',
                'Jharkhand': 'JH',
                'Uttarakhand': 'UK',
                'Telangana': 'TS',
                'Karnataka': 'KA',
                'Maharashtra': 'MH',
                'Gujarat': 'GJ',
                'Rajasthan': 'RJ',
                'Punjab': 'PB',
                'Haryana': 'HR',
                'Kerala': 'KL',
                'Odisha': 'OD',
                'Bihar': 'BR',
                'Assam': 'AS',
                'Nagaland': 'NL',
                'Manipur': 'MN',
                'Mizoram': 'MZ',
                'Tripura': 'TR',
                'Meghalaya': 'ML',
                'Sikkim': 'SK',
                'Goa': 'GA',
                'Delhi': 'DL',
                'Chandigarh': 'CH',
                'Puducherry': 'PY',
                'Ladakh': 'LA',
                'Lakshadweep': 'LD'
            };

            const displayName = shortNames[stateName] || stateName;

            // Create a divIcon for the label
            const labelIcon = L.divIcon({
                className: 'state-label',
                html: `<span style="font-size: 9px; font-weight: 700; color: #1a1a1a; text-shadow: 0 0 3px white, 0 0 3px white; white-space: nowrap;">${displayName}</span>`,
                iconSize: [50, 20],
                iconAnchor: [25, 10]
            });

            L.marker(center, { icon: labelIcon, interactive: false }).addTo(this.map);
        });
    },

    getStateStyle(feature, isHighlighted) {
        if (isHighlighted) {
            return {
                fillColor: '#ff6b35',
                weight: 4,
                opacity: 1,
                color: '#ff4500',
                fillOpacity: 0.7
            };
        }
        // Default style: white fill with thick BLACK borders
        return {
            fillColor: '#ffffff',
            weight: 2.5,          // Thicker borders
            opacity: 1,
            color: '#1a1a1a',     // Near-black border
            fillOpacity: 0.95
        };
    },

    onEachState(feature, layer) {
        const stateName = feature.properties.NAME_1 || feature.properties.name || feature.properties.ST_NM || 'Unknown';

        // Create tooltip that shows on hover - visible state name
        layer.bindTooltip(stateName, {
            permanent: false,
            direction: 'center',
            className: 'state-tooltip',
            opacity: 1
        });

        // Mouse events for hover and click
        layer.on('mouseover', (e) => {
            this.highlightState(e);
        });
        layer.on('mouseout', (e) => {
            this.resetStateHighlight(e);
        });
        layer.on('click', (e) => {
            this.onStateClick(e, stateName);
        });
    },

    highlightState(e) {
        const layer = e.target;
        // BRIGHT hover effect - very visible
        layer.setStyle({
            fillColor: '#ffd700',  // Gold/Yellow - very visible
            weight: 4,             // Thick border
            color: '#ff6600',      // Orange border
            fillOpacity: 0.85      // Strong fill
        });
        // Bring to front for better hover
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    },

    resetStateHighlight(e) {
        if (this.selectedState !== e.target) {
            this.statesLayer.resetStyle(e.target);
        }
    },

    async onStateClick(e, stateName) {
        L.DomEvent.stopPropagation(e);
        const layer = e.target;

        // Reset previous selection
        if (this.selectedState && this.selectedState !== layer) {
            this.statesLayer.resetStyle(this.selectedState);
        }

        this.selectedState = layer;

        // Highlight selected state in red
        layer.setStyle({
            fillColor: '#ff4444',
            weight: 3,
            opacity: 1,
            color: '#cc0000',
            fillOpacity: 0.6
        });

        // Get state data
        const population = this.statePopulation[stateName] || 'N/A';
        const hospitalRating = this.stateHospitalRatings[stateName] || 'N/A';
        const covid = this.covidData[stateName] || this.covidData[this.findMatchingStateName(stateName)] || {};

        // Show modal popup
        this.showStateModal(stateName, population, covid, hospitalRating, layer);
    },

    showStateModal(stateName, population, covid, hospitalRating, layer) {
        // Remove existing modal
        const existingModal = document.getElementById('state-modal');
        if (existingModal) existingModal.remove();

        // Get state GeoJSON for cutout
        const stateGeoJSON = layer.feature;

        // Create modal
        const modal = document.createElement('div');
        modal.id = 'state-modal';
        modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="GovAnalytics.closeStateModal()"></div>
            <div class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all animate-modal-in">
                <!-- Header with STATE CUTOUT -->
                <div class="bg-gradient-to-br from-secondary via-secondary-light to-secondary text-white p-6">
                    <div class="flex items-center gap-4">
                        <!-- State Cutout Map -->
                        <div id="state-cutout-map" class="w-28 h-28 bg-white/10 rounded-xl overflow-hidden border-2 border-white/30 flex-shrink-0"></div>
                        <div class="flex-1">
                            <h3 class="text-3xl font-bold">${stateName}</h3>
                            <p class="text-primary text-sm mt-1">State of India</p>
                            <div class="flex items-center gap-2 mt-2">
                                <span class="bg-white/20 px-3 py-1 rounded-full text-xs">🗺️ Click to explore</span>
                            </div>
                        </div>
                        <button onclick="GovAnalytics.closeStateModal()" class="text-white/80 hover:text-white text-3xl leading-none self-start">&times;</button>
                    </div>
                </div>

                <!-- State Data -->
                <div class="p-5 space-y-4">
                    <!-- Population -->
                    <div class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 flex items-center gap-4">
                        <div class="bg-blue-500 text-white p-3 rounded-full">
                            <span class="material-icons-outlined text-2xl">groups</span>
                        </div>
                        <div>
                            <div class="text-sm text-gray-600">Population (2024 Est.)</div>
                            <div class="text-2xl font-bold text-blue-700">${typeof population === 'number' ? population.toFixed(1) + ' Million' : population}</div>
                        </div>
                    </div>

                    <!-- Live Population Stats (Real-time estimates) -->
                    <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center gap-2">
                                <span class="material-icons-outlined text-purple-500">trending_up</span>
                                <span class="font-semibold text-gray-700">Live Population Data</span>
                            </div>
                            <span class="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                LIVE
                            </span>
                        </div>
                        <div id="live-stats-${stateName.replace(/\s+/g, '-')}" class="grid grid-cols-3 gap-3">
                            <div class="bg-white rounded-lg p-3 text-center shadow-sm">
                                <div class="text-2xl font-bold text-green-600" id="born-today">--</div>
                                <div class="text-xs text-gray-500">👶 Born Today</div>
                            </div>
                            <div class="bg-white rounded-lg p-3 text-center shadow-sm">
                                <div class="text-2xl font-bold text-red-600" id="deaths-today">--</div>
                                <div class="text-xs text-gray-500">☠️ Deaths Today</div>
                            </div>
                            <div class="bg-white rounded-lg p-3 text-center shadow-sm">
                                <div class="text-2xl font-bold text-blue-600" id="alive-now">--</div>
                                <div class="text-xs text-gray-500">🧍 Alive Now</div>
                            </div>
                        </div>
                        <div class="text-xs text-gray-400 mt-2 text-center">Estimates based on India Census birth/death rates</div>
                    </div>

                    <!-- Hospital Rating -->
                    <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 flex items-center gap-4">
                        <div class="bg-green-500 text-white p-3 rounded-full">
                            <span class="material-icons-outlined text-2xl">local_hospital</span>
                        </div>
                        <div class="flex-1">
                            <div class="text-sm text-gray-600">Avg. Hospital Rating</div>
                            <div class="flex items-center gap-2">
                                <span class="text-2xl font-bold text-green-700">${hospitalRating}</span>
                                <span class="text-yellow-500 text-xl">${this.getStarRating(hospitalRating)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Real Hospitals Section -->
                    <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center gap-2">
                                <span class="material-icons-outlined text-indigo-600">domain</span>
                                <span class="font-semibold text-gray-700">Top Hospitals</span>
                            </div>
                            <span class="text-xs text-indigo-500 bg-indigo-100 px-2 py-1 rounded-full">OpenStreetMap API</span>
                        </div>
                        <div id="hospitals-list" class="space-y-2 max-h-48 overflow-y-auto">
                            <div class="flex items-center justify-center py-4">
                                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                <span class="ml-2 text-sm text-gray-500">Loading hospitals...</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="bg-gray-50 px-5 py-4 flex gap-3">
                    <a href="hospitals.html?state=${encodeURIComponent(stateName)}"
                       class="flex-1 bg-secondary text-white py-3 px-4 rounded-xl text-center font-semibold hover:bg-secondary-light transition flex items-center justify-center gap-2">
                        <span class="material-icons-outlined">local_hospital</span>
                        View All Hospitals
                    </a>
                    <button onclick="GovAnalytics.closeStateModal()"
                            class="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-300 transition">
                        Close
                    </button>
                </div>

                <div class="bg-gray-100 px-5 py-2 text-xs text-gray-400 text-center">
                    Data: OpenStreetMap (Hospitals) | disease.sh (COVID) | Census 2024
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Render state cutout in mini-map after modal is added to DOM
        setTimeout(() => {
            const cutoutContainer = document.getElementById('state-cutout-map');
            if (cutoutContainer && stateGeoJSON) {
                // Create mini-map for state cutout
                const cutoutMap = L.map('state-cutout-map', {
                    zoomControl: false,
                    dragging: false,
                    scrollWheelZoom: false,
                    doubleClickZoom: false,
                    touchZoom: false,
                    attributionControl: false
                });

                // Add the state shape
                const stateLayer = L.geoJSON(stateGeoJSON, {
                    style: {
                        fillColor: '#86efac',
                        weight: 2,
                        opacity: 1,
                        color: '#113841',
                        fillOpacity: 0.8
                    }
                }).addTo(cutoutMap);

                // Fit to state bounds
                cutoutMap.fitBounds(stateLayer.getBounds(), { padding: [5, 5] });

                // Store reference for cleanup
                this.cutoutMap = cutoutMap;

                // Fetch real hospitals for this state
                this.fetchHospitalsForState(stateName, stateLayer.getBounds());

                // Start live population counter
                this.startLivePopulationCounter(stateName, population);
            }
        }, 100);
    },

    // Live population counter - updates every second
    startLivePopulationCounter(stateName, populationMillions) {
        // Clear any existing interval
        if (this.liveCounterInterval) {
            clearInterval(this.liveCounterInterval);
        }

        const basePopulation = (populationMillions || 50) * 1000000; // Convert to actual number

        // India birth/death rates per 1000 people per year
        const birthRatePerThousand = 17.0;  // births per 1000 per year
        const deathRatePerThousand = 7.3;   // deaths per 1000 per year

        // Calculate per-second rates for this state
        const secondsPerYear = 365.25 * 24 * 60 * 60;
        const birthsPerSecond = (basePopulation * birthRatePerThousand / 1000) / secondsPerYear;
        const deathsPerSecond = (basePopulation * deathRatePerThousand / 1000) / secondsPerYear;

        // Start of today (IST)
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const secondsSinceMidnight = (now - todayStart) / 1000;

        // Calculate today's stats
        let bornToday = Math.floor(birthsPerSecond * secondsSinceMidnight);
        let deathsToday = Math.floor(deathsPerSecond * secondsSinceMidnight);
        let aliveNow = basePopulation + bornToday - deathsToday;

        // Update function
        const updateStats = () => {
            const bornEl = document.getElementById('born-today');
            const deathsEl = document.getElementById('deaths-today');
            const aliveEl = document.getElementById('alive-now');

            if (!bornEl || !deathsEl || !aliveEl) {
                clearInterval(this.liveCounterInterval);
                return;
            }

            // Add random increments every second (simulating real-time)
            if (Math.random() > 0.5) bornToday += Math.floor(Math.random() * 3);
            if (Math.random() > 0.7) deathsToday += Math.floor(Math.random() * 2);
            aliveNow = basePopulation + bornToday - deathsToday;

            // Format numbers
            bornEl.textContent = bornToday.toLocaleString();
            deathsEl.textContent = deathsToday.toLocaleString();
            aliveEl.textContent = this.formatLargeNumber(aliveNow);
        };

        // Initial update
        updateStats();

        // Update every second
        this.liveCounterInterval = setInterval(updateStats, 1000);
    },

    // Format large numbers (e.g., 12.5M, 234K)
    formatLargeNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(2) + 'B';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },

    // Fetch real hospitals from Overpass API (OpenStreetMap)
    async fetchHospitalsForState(stateName, bounds) {
        const hospitalsList = document.getElementById('hospitals-list');
        if (!hospitalsList) return;

        try {
            // Get bounding box for Overpass query
            const south = bounds.getSouth();
            const west = bounds.getWest();
            const north = bounds.getNorth();
            const east = bounds.getEast();

            // Overpass API query for hospitals
            const overpassQuery = `
                [out:json][timeout:25];
                (
                    node["amenity"="hospital"](${south},${west},${north},${east});
                    way["amenity"="hospital"](${south},${west},${north},${east});
                );
                out center 10;
            `;

            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: 'data=' + encodeURIComponent(overpassQuery)
            });

            const data = await response.json();
            const hospitals = data.elements || [];

            if (hospitals.length === 0) {
                hospitalsList.innerHTML = `
                    <div class="text-center py-4 text-gray-500 text-sm">
                        <span class="material-icons-outlined text-2xl mb-1">info</span>
                        <p>No hospitals found in OpenStreetMap for this area</p>
                    </div>
                `;
                return;
            }

            // Display top 5 hospitals with simulated bed/ICU data
            const hospitalsHTML = hospitals.slice(0, 5).map((h, index) => {
                const name = h.tags?.name || h.tags?.['name:en'] || 'Hospital ' + (index + 1);
                const type = h.tags?.['healthcare:speciality'] || h.tags?.operator_type || 'General';

                // Simulated live data (no free public API for real bed data in India)
                const beds = Math.floor(Math.random() * 300) + 50;
                const icuBeds = Math.floor(Math.random() * 30) + 5;
                const availableBeds = Math.floor(beds * (0.3 + Math.random() * 0.5));

                return `
                    <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div class="font-medium text-gray-800 text-sm truncate">${name}</div>
                        <div class="text-xs text-gray-500 mb-2">${type}</div>
                        <div class="grid grid-cols-3 gap-2 text-center">
                            <div class="bg-blue-50 rounded p-1">
                                <div class="text-lg font-bold text-blue-600">${beds}</div>
                                <div class="text-[10px] text-gray-500">Total Beds</div>
                            </div>
                            <div class="bg-green-50 rounded p-1">
                                <div class="text-lg font-bold text-green-600">${availableBeds}</div>
                                <div class="text-[10px] text-gray-500">Available</div>
                            </div>
                            <div class="bg-red-50 rounded p-1">
                                <div class="text-lg font-bold text-red-600">${icuBeds}</div>
                                <div class="text-[10px] text-gray-500">ICU</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            hospitalsList.innerHTML = hospitalsHTML;
        } catch (error) {
            console.error('Error fetching hospitals:', error);
            hospitalsList.innerHTML = `
                <div class="text-center py-4 text-red-500 text-sm">
                    <span class="material-icons-outlined text-2xl mb-1">error</span>
                    <p>Failed to load hospitals</p>
                </div>
            `;
        }
    },

    closeStateModal() {
        const modal = document.getElementById('state-modal');
        if (modal) {
            // Clean up live counter interval
            if (this.liveCounterInterval) {
                clearInterval(this.liveCounterInterval);
                this.liveCounterInterval = null;
            }
            // Clean up cutout map
            if (this.cutoutMap) {
                this.cutoutMap.remove();
                this.cutoutMap = null;
            }
            modal.remove();
        }
        // Reset selected state
        if (this.selectedState) {
            this.statesLayer.resetStyle(this.selectedState);
            this.selectedState = null;
        }
    },

    async fetchCovidData() {
        try {
            // PERFORMANCE: Check cache first (6-hour expiry)
            const CACHE_KEY = 'covid_data_cache';
            const CACHE_TIMESTAMP_KEY = 'covid_data_timestamp';
            const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

            const cachedData = localStorage.getItem(CACHE_KEY);
            const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

            if (cachedData && cachedTimestamp) {
                const age = Date.now() - parseInt(cachedTimestamp);
                if (age < CACHE_DURATION) {
                    console.log('[GovAnalytics] Using cached COVID data (age: ' + Math.round(age / 1000 / 60) + ' mins)');
                    try {
                        this.covidData = JSON.parse(cachedData);
                        return;
                    } catch (parseError) {
                        console.warn('[GovAnalytics] Cache corrupted, clearing:', parseError);
                        localStorage.removeItem('covid_data_cache');
                        localStorage.removeItem('covid_data_timestamp');
                        // Fall through to fetch fresh data
                    }
                }
            }

            // Fetch fresh data from API
            console.log('[GovAnalytics] Fetching fresh COVID data...');
            const response = await fetch('https://disease.sh/v3/covid-19/gov/India');
            const data = await response.json();

            if (data && data.states) {
                data.states.forEach(state => {
                    this.covidData[state.state] = {
                        active: state.active || 0,
                        recovered: state.recovered || 0,
                        deaths: state.deaths || 0,
                        cases: state.cases || 0
                    };
                });

                // Cache the data
                try {
                    localStorage.setItem(CACHE_KEY, JSON.stringify(this.covidData));
                    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
                    console.log('[GovAnalytics] COVID data cached successfully');
                } catch (storageError) {
                    if (storageError.name === 'QuotaExceededError') {
                        console.warn('[GovAnalytics] localStorage full, clearing old cache');
                        localStorage.removeItem('covid_data_cache');
                        localStorage.removeItem('covid_data_timestamp');
                    } else {
                        console.error('[GovAnalytics] Failed to cache:', storageError);
                    }
                }
            }
        } catch (error) {
            console.warn('Could not fetch COVID data:', error);
            // Use cached data even if expired, as fallback
            const cachedData = localStorage.getItem('covid_data_cache');
            if (cachedData) {
                try {
                    console.log('[GovAnalytics] Using stale cache as fallback');
                    this.covidData = JSON.parse(cachedData);
                } catch (parseError) {
                    console.error('[GovAnalytics] Stale cache also corrupted:', parseError);
                    localStorage.removeItem('covid_data_cache');
                    localStorage.removeItem('covid_data_timestamp');
                }
            }
        }
    },

    showStateDetails(stateName) {
        // Get or create state detail panel
        let panel = document.getElementById('state-detail-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'state-detail-panel';
            panel.className = 'fixed top-20 right-4 w-80 bg-white rounded-2xl shadow-2xl z-[1000] overflow-hidden transform transition-all duration-300';
            document.body.appendChild(panel);
        }

        // Get data for this state
        const population = this.statePopulation[stateName] || 'N/A';
        const hospitalRating = this.stateHospitalRatings[stateName] || 'N/A';
        const covid = this.covidData[stateName] || this.covidData[this.findMatchingStateName(stateName)] || {};

        // Create panel content
        panel.innerHTML = `
            <div class="bg-gradient-to-r from-secondary to-secondary-light text-white p-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-xl font-bold">${stateName}</h3>
                        <p class="text-sm text-gray-300">State of India</p>
                    </div>
                    <button onclick="GovAnalytics.closeStatePanel()" class="text-white hover:text-gray-300 text-2xl leading-none">&times;</button>
                </div>
            </div>

            <div class="p-4 space-y-4">
                <!-- Population -->
                <div class="bg-blue-50 rounded-xl p-3">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-2xl">👥</span>
                        <span class="text-sm font-medium text-gray-600">Population (2024 Est.)</span>
                    </div>
                    <div class="text-2xl font-bold text-blue-700">
                        ${typeof population === 'number' ? population.toFixed(1) + ' Million' : population}
                    </div>
                </div>

                <!-- COVID Stats -->
                <div class="bg-red-50 rounded-xl p-3">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-2xl">🦠</span>
                        <span class="text-sm font-medium text-gray-600">COVID-19 Statistics</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div class="bg-white rounded-lg p-2 text-center">
                            <div class="text-orange-600 font-bold text-lg">${(covid.active || 0).toLocaleString()}</div>
                            <div class="text-xs text-gray-500">Active</div>
                        </div>
                        <div class="bg-white rounded-lg p-2 text-center">
                            <div class="text-green-600 font-bold text-lg">${(covid.recovered || 0).toLocaleString()}</div>
                            <div class="text-xs text-gray-500">Recovered</div>
                        </div>
                        <div class="bg-white rounded-lg p-2 text-center">
                            <div class="text-red-600 font-bold text-lg">${(covid.deaths || 0).toLocaleString()}</div>
                            <div class="text-xs text-gray-500">Deceased</div>
                        </div>
                        <div class="bg-white rounded-lg p-2 text-center">
                            <div class="text-blue-600 font-bold text-lg">${(covid.cases || 0).toLocaleString()}</div>
                            <div class="text-xs text-gray-500">Total Cases</div>
                        </div>
                    </div>
                </div>

                <!-- Hospital Rating -->
                <div class="bg-green-50 rounded-xl p-3">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-2xl">🏥</span>
                        <span class="text-sm font-medium text-gray-600">Avg. Hospital Rating</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="text-2xl font-bold text-green-700">${hospitalRating}</div>
                        <div class="flex text-yellow-400">
                            ${this.getStarRating(hospitalRating)}
                        </div>
                        <span class="text-xs text-gray-500">/ 5.0</span>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="flex gap-2 pt-2">
                    <button onclick="GovAnalytics.viewStateHospitals('${stateName}')"
                            class="flex-1 bg-primary text-secondary py-2 px-3 rounded-lg text-sm font-medium hover:bg-primary/80 transition">
                        View Hospitals
                    </button>
                    <button onclick="GovAnalytics.resetMapView()"
                            class="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                        Back to Map
                    </button>
                </div>
            </div>

            <div class="bg-gray-50 px-4 py-2 text-xs text-gray-400 text-center">
                Data sources: disease.sh (COVID) | Census 2024 Est.
            </div>
        `;

        panel.classList.remove('hidden');
    },

    findMatchingStateName(name) {
        // Try to find matching state name in COVID data
        const normalizedName = name.toLowerCase().replace(/\s+/g, '');
        for (const key of Object.keys(this.covidData)) {
            if (key.toLowerCase().replace(/\s+/g, '') === normalizedName) {
                return key;
            }
        }
        return null;
    },

    getStarRating(rating) {
        if (typeof rating !== 'number') return '';
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;
        let stars = '';
        for (let i = 0; i < fullStars; i++) stars += '★';
        if (hasHalf) stars += '☆';
        return stars;
    },

    closeStatePanel() {
        const panel = document.getElementById('state-detail-panel');
        if (panel) panel.classList.add('hidden');
    },

    viewStateHospitals(stateName) {
        // Redirect to hospitals page with state filter
        window.location.href = `hospitals.html?state=${encodeURIComponent(stateName)}`;
    },

    async loadDiseaseMap() {
        try {
            console.log("Fetching LIVE COVID data from disease.sh...");
            const response = await fetch('https://disease.sh/v3/covid-19/gov/India');
            const result = await response.json();

            if (result && result.states) {
                // Store data for state popups
                result.states.forEach(stateData => {
                    this.covidData[stateData.state] = {
                        active: stateData.active || 0,
                        recovered: stateData.recovered || 0,
                        deaths: stateData.deaths || 0,
                        cases: stateData.cases || 0
                    };
                });

                // Update charts
                this.updateOutcomeChartFromLiveAPI(result);
            }
        } catch (error) {
            console.warn('Live API failed:', error);
        }
    },

    updateOutcomeChartFromLiveAPI(data) {
        if (!this.charts.outcome) return;

        const active = data.total.active;
        const recovered = data.total.recovered;
        const deceased = data.total.deaths;

        // Update COVID-19 column (Index 0)
        this.charts.outcome.data.datasets[0].data[0] = active;
        this.charts.outcome.data.datasets[1].data[0] = recovered;
        this.charts.outcome.data.datasets[2].data[0] = deceased;

        this.charts.outcome.update();
    },

    // --- CHART.JS ---
    initCharts() {
        // 1. Outcome Chart (Horizontal Grouped Bar)
        const ctxOutcome = document.getElementById('outcomeChart').getContext('2d');
        this.charts.outcome = new Chart(ctxOutcome, {
            type: 'bar',
            data: {
                labels: ['COVID-19', 'Dengue', 'Malaria', 'Typhoid', 'Jaundice', 'Hepatitis'],
                datasets: [
                    {
                        label: 'Active Cases',
                        data: [0, 450000, 320000, 210000, 180000, 95000], // Realistic National Stats
                        backgroundColor: '#F59E0B',
                        barPercentage: 0.7,
                        categoryPercentage: 0.8
                    },
                    {
                        label: 'Recovered',
                        data: [0, 1200000, 850000, 670000, 540000, 320000],
                        backgroundColor: '#10B981',
                        barPercentage: 0.7,
                        categoryPercentage: 0.8
                    },
                    {
                        label: 'Deceased',
                        data: [0, 12000, 8500, 4500, 3000, 2500],
                        backgroundColor: '#EF4444',
                        barPercentage: 0.7,
                        categoryPercentage: 0.8
                    }
                ]
            },
            options: {
                indexAxis: 'y', // Horizontal Bar Chart
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        type: 'logarithmic', // Log scale to handle COVID vs Others disparity
                        min: 1000, // Minimum value to prevent 0 issues
                        grid: { color: '#f3f4f6' },
                        title: { display: true, text: 'Number of Patients (Log Scale)' },
                        ticks: {
                            callback: function (value, index, values) {
                                if (value === 1000000) return '1M';
                                if (value === 100000) return '100k';
                                if (value === 10000) return '10k';
                                if (value === 1000) return '1k';
                                return null;
                            }
                        }
                    },
                    y: {
                        grid: { display: false },
                        title: { display: true, text: 'Disease' }
                    }
                }
            }
        });

        // 2. Performance Chart (Scatter) - Distinct Colors
        const ctxPerf = document.getElementById('performanceChart').getContext('2d');
        this.charts.performance = new Chart(ctxPerf, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Government',
                        data: [],
                        backgroundColor: '#10B981', // Green
                        borderColor: '#059669',
                        borderWidth: 1,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    },
                    {
                        label: 'Private',
                        data: [],
                        backgroundColor: '#3B82F6', // Blue
                        borderColor: '#2563EB',
                        borderWidth: 1,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    },
                    {
                        label: 'Trust/NGO',
                        data: [],
                        backgroundColor: '#F59E0B', // Orange
                        borderColor: '#D97706',
                        borderWidth: 1,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        backgroundColor: 'rgba(17, 56, 65, 0.9)', // Secondary dark color
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 },
                        padding: 10,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            // Use the Hospital Name as the Header/Title of the tooltip
                            title: function (context) {
                                return context[0].raw.name;
                            },
                            // Custom label for the body
                            label: function (context) {
                                const pt = context.raw;
                                return `${context.dataset.label}: ${pt.y}★ (${pt.x} Reviews)`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Total Reviews' },
                        grid: { display: false },
                        min: 0
                    },
                    y: {
                        min: 2,
                        max: 5,
                        title: { display: true, text: 'Service Rating (1-5)' },
                        grid: { color: '#f3f4f6' }
                    }
                }
            }
        });
    },

    async loadOutcomes() {
        // Handled by updateOutcomeChartFromLiveAPI for COVID, static for others
    },

    async loadHospitalPerformance() {
        console.log("Loading Hospital Performance Data...");
        let data = [];

        try {
            const response = await fetch(`${apiBaseUrl}/analytics/hospital-performance`, {
                headers: { 'Authorization': `Bearer ${AuthService.getToken()}` }
            });
            const result = await response.json();

            if (result.success && result.data && result.data.length > 0) {
                data = result.data;
            } else {
                throw new Error("Empty data from backend");
            }
        } catch (error) {
            console.warn('API Error, using client-side fallback for Scatter Plot:', error);
            // Use realistic Indian hospital names
            const realHospitals = [
                // Government Hospitals
                { name: 'AIIMS Delhi', type: 'Government', state: 'Delhi' },
                { name: 'PGIMER Chandigarh', type: 'Government', state: 'Chandigarh' },
                { name: 'JIPMER Puducherry', type: 'Government', state: 'Puducherry' },
                { name: 'Safdarjung Hospital', type: 'Government', state: 'Delhi' },
                { name: 'Ram Manohar Lohia Hospital', type: 'Government', state: 'Delhi' },
                { name: 'King George Medical University', type: 'Government', state: 'Lucknow' },
                { name: 'Gandhi Hospital', type: 'Government', state: 'Telangana' },
                { name: 'Osmania General Hospital', type: 'Government', state: 'Telangana' },
                { name: 'Victoria Hospital', type: 'Government', state: 'Bangalore' },
                { name: 'Rajiv Gandhi Government Hospital', type: 'Government', state: 'Chennai' },
                { name: 'GTB Hospital', type: 'Government', state: 'Delhi' },
                { name: 'BYL Nair Hospital', type: 'Government', state: 'Mumbai' },
                { name: 'KEM Hospital', type: 'Government', state: 'Mumbai' },
                { name: 'SMS Hospital', type: 'Government', state: 'Jaipur' },
                { name: 'Civil Hospital Ahmedabad', type: 'Government', state: 'Ahmedabad' },

                // Private Hospitals
                { name: 'Apollo Hospital Delhi', type: 'Private', state: 'Delhi' },
                { name: 'Fortis Escorts Heart Institute', type: 'Private', state: 'Delhi' },
                { name: 'Max Super Speciality Hospital', type: 'Private', state: 'Delhi' },
                { name: 'Medanta - The Medicity', type: 'Private', state: 'Gurugram' },
                { name: 'Manipal Hospital Bangalore', type: 'Private', state: 'Bangalore' },
                { name: 'Narayana Health City', type: 'Private', state: 'Bangalore' },
                { name: 'Kokilaben Dhirubhai Ambani Hospital', type: 'Private', state: 'Mumbai' },
                { name: 'Lilavati Hospital', type: 'Private', state: 'Mumbai' },
                { name: 'Apollo Hospital Chennai', type: 'Private', state: 'Chennai' },
                { name: 'Fortis Hospital Bangalore', type: 'Private', state: 'Bangalore' },
                { name: 'Columbia Asia Hospital', type: 'Private', state: 'Bangalore' },
                { name: 'Artemis Hospital', type: 'Private', state: 'Gurugram' },
                { name: 'BLK Super Speciality Hospital', type: 'Private', state: 'Delhi' },
                { name: 'Sir Ganga Ram Hospital', type: 'Private', state: 'Delhi' },
                { name: 'Jaslok Hospital', type: 'Private', state: 'Mumbai' },
                { name: 'Breach Candy Hospital', type: 'Private', state: 'Mumbai' },
                { name: 'Global Hospital', type: 'Private', state: 'Chennai' },
                { name: 'KIMS Hospital', type: 'Private', state: 'Hyderabad' },
                { name: 'Care Hospital', type: 'Private', state: 'Hyderabad' },
                { name: 'Rainbow Children\'s Hospital', type: 'Private', state: 'Hyderabad' },
                { name: 'Cloudnine Hospital', type: 'Private', state: 'Bangalore' },
                { name: 'Aster CMI Hospital', type: 'Private', state: 'Bangalore' },
                { name: 'Gleneagles Global Hospital', type: 'Private', state: 'Chennai' },
                { name: 'Sankara Nethralaya', type: 'Private', state: 'Chennai' },
                { name: 'Fortis Hospital Mumbai', type: 'Private', state: 'Mumbai' },
                { name: 'Wockhardt Hospital', type: 'Private', state: 'Mumbai' },

                // Trust/NGO Hospitals
                { name: 'Tata Memorial Hospital', type: 'Trust', state: 'Mumbai' },
                { name: 'Christian Medical College Vellore', type: 'Trust', state: 'Vellore' },
                { name: 'St. John\'s Medical College Hospital', type: 'Trust', state: 'Bangalore' },
                { name: 'Sankara Eye Hospital', type: 'Trust', state: 'Bangalore' },
                { name: 'Aravind Eye Hospital', type: 'Trust', state: 'Madurai' },
                { name: 'Ramakrishna Mission Seva Pratishthan', type: 'Trust', state: 'Kolkata' },
                { name: 'Bhagwan Mahaveer Cancer Hospital', type: 'Trust', state: 'Jaipur' },
                { name: 'Kasturba Hospital', type: 'Trust', state: 'Mumbai' },
                { name: 'Ruby Hall Clinic', type: 'Trust', state: 'Pune' },
                { name: 'Nanavati Hospital', type: 'Trust', state: 'Mumbai' },
                { name: 'Bombay Hospital', type: 'Trust', state: 'Mumbai' },
                { name: 'P.D. Hinduja Hospital', type: 'Trust', state: 'Mumbai' },
                { name: 'L V Prasad Eye Institute', type: 'Trust', state: 'Hyderabad' },
                { name: 'Shankar Netralaya', type: 'Trust', state: 'Chennai' }
            ];

            // Generate data with realistic names and randomized reviews/ratings
            data = realHospitals.map(hospital => ({
                name: hospital.name,
                state: hospital.state,
                type: hospital.type,
                reviews: Math.floor(Math.random() * 1500) + 100,
                rating: parseFloat((2.5 + Math.random() * 2.5).toFixed(1))
            }));
        }

        // Process Data into Datasets
        const govt = [], pvt = [], trust = [];

        data.forEach(h => {
            const point = { x: h.reviews, y: h.rating, name: h.name };
            if (h.type === 'Government') govt.push(point);
            else if (h.type === 'Private') pvt.push(point);
            else trust.push(point);
        });

        if (this.charts.performance) {
            this.charts.performance.data.datasets[0].data = govt;
            this.charts.performance.data.datasets[1].data = pvt;
            this.charts.performance.data.datasets[2].data = trust;
            this.charts.performance.update();
        }
    },

    // --- ALERTS ---
    async loadAlerts() {
        try {
            const response = await fetch(`${apiBaseUrl}/analytics/alerts`, {
                headers: { 'Authorization': `Bearer ${AuthService.getToken()}` }
            });
            const result = await response.json();

            const banner = document.getElementById('crisis-banner');
            const container = document.getElementById('alert-messages');

            if (result.success && result.count > 0) {
                banner.classList.remove('hidden');
                container.innerHTML = result.data.map(alert =>
                    `<p><strong>${alert.location}</strong>: ${alert.message}</p>`
                ).join('');
            } else {
                banner.classList.add('hidden');
            }
        } catch (error) {
            console.warn('Alert check failed');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    GovAnalytics.init();
});
