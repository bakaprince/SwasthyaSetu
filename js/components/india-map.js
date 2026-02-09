/**
 * Modern Interactive India Map (Custom SVG Version)
 * Features: Pure SVG Rendering, Hardware Accelerated Animations, Full Interactive State
 */

const IndiaMap = {
    container: null,
    modal: null,
    hospitalsModal: null,
    diseaseChart: null,
    liveInterval: null,
    activeState: null, // Track currently active/locked state

    // Detailed State Colors
    // Detailed State Colors and Realistic Metadata (2024 Estimates + Rates)
    stateData: {
        "andaman and nicobar": { color: "#06b6d4", population: 403000, growthRate: 0.006, birthRate: 11.5, deathRate: 6.2, reviewScore: 4.2, diseases: { "Dengue": 40, "Malaria": 30, "Flu": 10, "Typhoid": 15, "Videos": 5 } },
        "andhra pradesh": { color: "#3b82f6", population: 53156000, growthRate: 0.009, birthRate: 15.7, deathRate: 6.8, reviewScore: 4.5, diseases: { "Viral Fever": 30, "Typhoid": 25, "Dengue": 20, "Diabetes": 15, "Hypertension": 10 } },
        "arunachal pradesh": { color: "#10b981", population: 1562000, growthRate: 0.021, birthRate: 18.0, deathRate: 6.5, reviewScore: 3.8, diseases: { "Malaria": 40, "Flu": 25, "TB": 15, "Skin Inf.": 10, "Other": 10 } },
        "assam": { color: "#8b5cf6", population: 35713000, growthRate: 0.013, birthRate: 20.8, deathRate: 6.4, reviewScore: 3.9, diseases: { "Malaria": 35, "J. Enceph.": 20, "Flu": 20, "TB": 15, "Cholera": 10 } },
        "bihar": { color: "#f59e0b", population: 126756000, growthRate: 0.023, birthRate: 25.4, deathRate: 5.6, reviewScore: 3.6, diseases: { "Typhoid": 30, "Malaria": 25, "Kala-azar": 15, "TB": 15, "Cholera": 15 } },
        "chandigarh": { color: "#ec4899", population: 1231000, growthRate: 0.019, birthRate: 13.0, deathRate: 4.1, reviewScore: 4.7, diseases: { "Dengue": 30, "Hypertension": 25, "Diabetes": 20, "Flu": 15, "Other": 10 } },
        "chhattisgarh": { color: "#6366f1", population: 30180000, growthRate: 0.016, birthRate: 22.0, deathRate: 7.3, reviewScore: 3.8, diseases: { "Malaria": 40, "Sickle Cell": 20, "TB": 15, "Typhoid": 15, "Flu": 10 } },
        "dadra and nagar haveli": { color: "#14b8a6", population: 615000, growthRate: 0.035, birthRate: 22.8, deathRate: 4.0, reviewScore: 4.0, diseases: { "Flu": 35, "Skin Inf.": 25, "Malaria": 15, "TB": 15, "Other": 10 } },
        "delhi": { color: "#ef4444", population: 33807000, growthRate: 0.026, birthRate: 14.8, deathRate: 5.8, reviewScore: 4.4, diseases: { "Respiratory": 40, "Dengue": 20, "Flu": 15, "Diabetes": 15, "Typhoid": 10 } },
        "goa": { color: "#f97316", population: 1575000, growthRate: 0.009, birthRate: 12.1, deathRate: 6.6, reviewScore: 4.6, diseases: { "Diabetes": 30, "Kidney": 20, "Liver": 15, "Flu": 20, "Dengue": 15 } },
        "gujarat": { color: "#84cc16", population: 71507000, growthRate: 0.014, birthRate: 19.3, deathRate: 5.9, reviewScore: 4.3, diseases: { "Diabetes": 25, "Heart": 20, "Typhoid": 15, "Flu": 20, "Dengue": 20 } },
        "haryana": { color: "#06b6d4", population: 30209000, growthRate: 0.016, birthRate: 19.9, deathRate: 6.1, reviewScore: 4.2, diseases: { "Dengue": 25, "Typhoid": 20, "Flu": 20, "TB": 15, "Diabetes": 20 } },
        "himachal pradesh": { color: "#3b82f6", population: 7468000, growthRate: 0.008, birthRate: 15.3, deathRate: 6.9, reviewScore: 4.5, diseases: { "Flu": 30, "Respiratory": 25, "Arthritis": 15, "TB": 15, "Other": 15 } },
        "jammu and kashmir": { color: "#ef4444", population: 13603000, growthRate: 0.010, birthRate: 14.9, deathRate: 5.1, reviewScore: 4.1, diseases: { "Flu": 35, "Respiratory": 25, "TB": 15, "Hepatitis": 15, "Other": 10 } },
        "jharkhand": { color: "#10b981", population: 39466000, growthRate: 0.015, birthRate: 21.8, deathRate: 5.6, reviewScore: 3.7, diseases: { "Malaria": 30, "TB": 25, "Typhoid": 15, "Anemia": 20, "Flu": 10 } },
        "karnataka": { color: "#f43f5e", population: 67692000, growthRate: 0.008, birthRate: 16.5, deathRate: 6.2, reviewScore: 4.6, diseases: { "Dengue": 25, "Diabetes": 20, "Heart": 15, "Flu": 20, "Typhoid": 20 } },
        "kerala": { color: "#0ea5e9", population: 35776000, growthRate: 0.005, birthRate: 13.6, deathRate: 7.1, reviewScore: 4.9, diseases: { "Diabetes": 30, "Hypertension": 20, "Dengue": 15, "Viral Fever": 20, "Other": 15 } },
        "ladakh": { color: "#8b5cf6", population: 300000, growthRate: 0.012, birthRate: 14.5, deathRate: 6.0, reviewScore: 4.0, diseases: { "Respiratory": 40, "Flu": 30, "Arthritis": 15, "TB": 10, "Other": 5 } },
        "madhya pradesh": { color: "#eab308", population: 86579000, growthRate: 0.018, birthRate: 23.9, deathRate: 6.5, reviewScore: 3.8, diseases: { "Malaria": 25, "TB": 20, "Typhoid": 20, "Flu": 20, "Cholera": 15 } },
        "maharashtra": { color: "#f97316", population: 126385000, growthRate: 0.011, birthRate: 15.3, deathRate: 5.7, reviewScore: 4.4, diseases: { "Dengue": 20, "Malaria": 15, "COVID-19": 10, "Flu": 30, "Diabetes": 25 } },
        "manipur": { color: "#ec4899", population: 3223000, growthRate: 0.014, birthRate: 13.9, deathRate: 4.9, reviewScore: 3.9, diseases: { "Malaria": 30, "TB": 20, "Flu": 20, "Typhoid": 15, "Other": 15 } },
        "meghalaya": { color: "#6366f1", population: 3349000, growthRate: 0.013, birthRate: 22.8, deathRate: 6.1, reviewScore: 4.0, diseases: { "Malaria": 35, "Flu": 25, "TB": 15, "Typhoid": 15, "Skin Inf.": 10 } },
        "mizoram": { color: "#14b8a6", population: 1238000, growthRate: 0.012, birthRate: 14.8, deathRate: 4.5, reviewScore: 4.1, diseases: { "Malaria": 30, "Cancer": 20, "Flu": 20, "TB": 15, "Other": 15 } },
        "nagaland": { color: "#ef4444", population: 2213000, growthRate: 0.007, birthRate: 12.3, deathRate: 3.5, reviewScore: 3.8, diseases: { "Malaria": 25, "TB": 20, "Flu": 25, "Typhoid": 15, "Other": 15 } },
        "odisha": { color: "#84cc16", population: 46276000, growthRate: 0.009, birthRate: 17.6, deathRate: 7.3, reviewScore: 4.0, diseases: { "Malaria": 30, "TB": 20, "Dengue": 15, "Typhoid": 20, "Flu": 15 } },
        "punjab": { color: "#f59e0b", population: 30730000, growthRate: 0.010, birthRate: 14.5, deathRate: 6.6, reviewScore: 4.2, diseases: { "Cancer": 15, "Heart": 20, "Diabetes": 20, "Dengue": 15, "Hepatitis": 30 } },
        "rajasthan": { color: "#eab308", population: 81032000, growthRate: 0.019, birthRate: 23.2, deathRate: 5.8, reviewScore: 3.9, diseases: { "Viral Fever": 25, "Typhoid": 20, "Malaria": 15, "Respiratory": 20, "TB": 20 } },
        "sikkim": { color: "#10b981", population: 690000, growthRate: 0.011, birthRate: 15.6, deathRate: 4.8, reviewScore: 4.6, diseases: { "TB": 20, "Flu": 30, "Stomach Inf.": 20, "Skin Inf.": 15, "Other": 15 } },
        "tamil nadu": { color: "#f43f5e", population: 76860000, growthRate: 0.006, birthRate: 13.8, deathRate: 6.7, reviewScore: 4.7, diseases: { "Diabetes": 25, "Dengue": 20, "Heart": 15, "Kidney": 15, "V. Fever": 25 } },
        "telangana": { color: "#3b82f6", population: 38090000, growthRate: 0.011, birthRate: 16.8, deathRate: 6.2, reviewScore: 4.3, diseases: { "Dengue": 25, "Viral Fever": 25, "Diabetes": 20, "Typhoid": 15, "Flu": 15 } },
        "tripura": { color: "#8b5cf6", population: 4147000, growthRate: 0.012, birthRate: 13.0, deathRate: 5.6, reviewScore: 4.1, diseases: { "Malaria": 30, "Flu": 25, "TB": 15, "J. Enceph.": 15, "Other": 15 } },
        "uttar pradesh": { color: "#f97316", population: 235687000, growthRate: 0.019, birthRate: 25.1, deathRate: 6.5, reviewScore: 3.7, diseases: { "Encephalitis": 20, "Malaria": 20, "Typhoid": 20, "TB": 15, "Flu": 25 } },
        "uttarakhand": { color: "#0ea5e9", population: 11637000, growthRate: 0.013, birthRate: 16.2, deathRate: 6.0, reviewScore: 4.2, diseases: { "Flu": 30, "TB": 20, "Respiratory": 20, "Typhoid": 15, "Other": 15 } },
        "west bengal": { color: "#ec4899", population: 99084000, growthRate: 0.009, birthRate: 14.7, deathRate: 5.7, reviewScore: 4.0, diseases: { "Dengue": 25, "Malaria": 20, "TB": 15, "Cholera": 15, "Arsenic": 25 } }
    },

    calculateLiveStats(stateData) {
        if (!stateData) return { population: 0, born: 0, died: 0 };

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const info = stateData;
        const pop = info.population || 1000000;

        // Seconds since midnight
        const secondsSinceMidnight = (now.getTime() - startOfDay) / 1000;
        const totalSecondsInDay = 86400;

        // Daily Calculation
        // Birth Rate = (Births per 1000 per year)
        // Daily Births = (Pop * (BirthRate/1000)) / 365
        const dailyBirths = (pop * (info.birthRate || 18.0) / 1000) / 365;
        const bornSoFar = Math.floor((secondsSinceMidnight / totalSecondsInDay) * dailyBirths);

        // Daily Deaths
        const dailyDeaths = (pop * (info.deathRate || 6.0) / 1000) / 365;
        const diedSoFar = Math.floor((secondsSinceMidnight / totalSecondsInDay) * dailyDeaths);

        // Live Population Projection (Base + (Born - Died) + GrowthFactor)
        // We just extrapolate slightly for the 'ticking' effect
        // Current Pop = Base + BornSoFar - DiedSoFar (roughly)
        const currentPop = pop + bornSoFar - diedSoFar;

        return {
            population: currentPop,
            born: bornSoFar,
            died: diedSoFar
        };
    },

    stateColors: {
        // ... (This object is now redundant if we fallback to stateData, but keeping just in case for generic logic)
        "andaman and nicobar": "#06b6d4",
        // ... Keeping map to keys if needed, but logic below will use stateData
    },


    // Manual Path Overrides removed - all states now use GeoJSON geometry
    // This ensures consistent projection and proper MultiPolygon support
    manualPaths: {},

    init() {
        this.container = document.getElementById('india-map');
        if (!this.container) return;

        // Initialize Modals
        this.initModals();

        // Load and Render Logic
        this.loadMapData();
    },

    initModals() {
        // State Details Modal
        const modalHTML = `
            <div id="state-popout-modal" class="state-popout-modal">
                <div class="popout-backdrop"></div>
                <div class="popout-container">
                    <button class="popout-close"><span class="material-icons-outlined">close</span></button>

                    <!-- Data Connectors -->
                    <div class="data-connector top-right">
                        <div class="connector-line"></div>
                        <div class="connector-line"></div>
                        <div class="data-box dashboard-card">
                            <div class="data-box-header"><span class="material-icons-outlined">people</span> Total Population</div>
                            <div class="data-box-value large" id="modal-population">0
                                <span class="stars">✨</span>
                            </div>
                            <div class="data-box-sub-grid">
                                <div class="stat-row born">
                                    <span class="material-icons-outlined">child_friendly</span>
                                    <span class="stat-label">Born Today</span>
                                    <span class="stat-number" id="modal-born">0</span>
                                </div>
                                <div class="stat-row died">
                                    <span class="material-icons-outlined">favorite_border</span>
                                    <span class="stat-label">Deceased</span>
                                    <span class="stat-number" id="modal-died">0</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="data-connector bottom-right">
                        <div class="connector-line"></div>
                        <div class="data-box dashboard-card large live-population-box">
                            <div class="data-box-header">
                                <span class="material-icons-outlined">star</span>
                                <div class="pulse-dot"></div> Average Hospital Review
                            </div>
                            <div class="data-box-value" id="modal-live-users">4.5/5</div>
                            <div class="data-box-sub">Based on patient feedback</div>
                        </div>
                    </div>

                    <div class="data-connector left-side">
                        <div class="connector-line"></div>
                        <div class="data-box dashboard-card disease-box">
                            <div class="data-box-header"><span class="material-icons-outlined">coronavirus</span> Top 5 Diseases</div>
                            <div class="disease-stats-grid">
                                <div class="disease-stat active">
                                    <span class="disease-stat-value" id="stats-dengue">0</span>
                                    <span class="disease-stat-label">Dengue</span>
                                </div>
                                <div class="disease-stat recovered">
                                    <span class="disease-stat-value" id="stats-malaria">0</span>
                                    <span class="disease-stat-label">Malaria</span>
                                </div>
                                <div class="disease-stat deceased">
                                    <span class="disease-stat-value" id="stats-covid">0</span>
                                    <span class="disease-stat-label">COVID-19</span>
                                </div>
                            </div>
                            <div class="disease-chart-container">
                                <canvas id="disease-chart"></canvas>
                            </div>
                        </div>
                    </div>

                    <div class="popout-center-column">
                        <div class="popout-state-visual" id="modal-state-visual">
                            <!-- SVG Injected Here -->
                        </div>
                        <div class="state-name-overlay" id="modal-state-name">State Name</div>
                        <button class="popout-action-btn centered" id="view-hospitals-btn">
                            <span class="material-icons-outlined">local_hospital</span>
                            View Hospitals
                        </button>
                    </div>
                </div>
            </div>

            <!-- Hospitals List Modal -->
            <div id="hospitals-modal" class="hospitals-modal">
                <div class="hospitals-backdrop"></div>
                <div class="hospitals-content">
                    <div class="hospitals-header">
                        <h2 id="hospitals-title">Hospitals</h2>
                        <button class="hospitals-close"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <div class="hospitals-search">
                        <span class="material-icons-outlined">search</span>
                        <input type="text" id="hospital-search-input" placeholder="Search hospitals...">
                    </div>
                    <div class="hospitals-list" id="hospitals-list"></div>
                </div>
            </div>
        `;

        if (!document.getElementById('state-popout-modal')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        this.modal = document.getElementById('state-popout-modal');
        this.hospitalsModal = document.getElementById('hospitals-modal');

        // Close Events
        this.modal.querySelector('.popout-close').addEventListener('click', () => this.closeModal());
        this.modal.querySelector('.popout-backdrop').addEventListener('click', () => this.closeModal());

        // Data Box Toggle Logic
        const dataBoxes = this.modal.querySelectorAll('.data-box');
        dataBoxes.forEach(box => {
            box.addEventListener('click', () => {
                // Remove active from all
                dataBoxes.forEach(b => b.classList.remove('active'));
                // Add to clicked
                box.classList.add('active');
            });
        });

        this.hospitalsModal.querySelector('.hospitals-close').addEventListener('click', () => {
            this.hospitalsModal.classList.remove('visible');
        });
        this.hospitalsModal.querySelector('.hospitals-backdrop').addEventListener('click', () => {
            this.hospitalsModal.classList.remove('visible');
        });

        // View Hospitals Click
        document.getElementById('view-hospitals-btn')?.addEventListener('click', () => {
            this.showHospitalsList();
        });
    },

    async loadMapData() {
        try {
            this.container.innerHTML = `<div class="map-loader"><div class="spinner"></div><div class="loading-text">Building Map...</div></div>`;
            const response = await fetch('../js/data/india_states.geojson');
            const data = await response.json();
            this.container.innerHTML = '';
            this.renderSVG(data);
        } catch (error) {
            console.error('Error loading map data:', error);
            this.container.innerHTML = `<div style="color:red;text-align:center;padding:2rem;">Failed to load map data.</div>`;
        }
    },

    // --- Core SVG Rendering Logic ---
    renderSVG(geoJSON) {
        const bounds = this.getBounds(geoJSON);
        const width = 800;
        const height = 900;
        const padding = 20;

        const project = (lon, lat) => {
            const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * (width - 2 * padding) + padding;
            const y = height - (((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * (height - 2 * padding) + padding);
            return { x, y };
        };

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg.setAttribute("class", "india-svg-map");
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

        const defs = document.createElementNS(svgNS, "defs");
        defs.innerHTML = `<filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="lift-shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="rgba(0,0,0,0.3)"/></filter>`;
        svg.appendChild(defs);

        const mapGroup = document.createElementNS(svgNS, "g");
        mapGroup.setAttribute("class", "map-group");
        svg.appendChild(mapGroup);

        geoJSON.features.forEach((feature, index) => {
            const rawName = feature.properties.NAME_1 || feature.properties.ST_NM || feature.properties.name || "Unknown";
            const normalizedName = this.normalizeName(rawName);

            const color = this.getColor(normalizedName);

            // Generate path data from GeoJSON geometry
            const pathData = this.generatePathData(feature.geometry, project);

            if (!pathData || pathData.length < 10) return; // Skip broken geometries

            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", pathData);
            path.setAttribute("fill", color);
            path.setAttribute("class", "state-path");
            path.setAttribute("data-name", rawName);
            path.setAttribute("id", `state-${index}`);

            path.addEventListener('mouseenter', (e) => this.onStateHover(e, path));
            path.addEventListener('mouseleave', (e) => this.onStateLeave(e, path));
            path.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onStateClick(feature);
            });

            this.addTooltip(path, rawName);
            mapGroup.appendChild(path);
        });

        this.container.addEventListener('click', () => this.clearActiveState());
        this.container.appendChild(svg);
    },

    // Calculate Bounding Box from GeoJSON FeatureCollection
    getBounds(geoJSON) {
        let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;

        const processRing = (ring) => {
            if (!Array.isArray(ring)) return;
            ring.forEach(coord => {
                if (!Array.isArray(coord) || coord.length < 2) return;
                const [lon, lat] = coord;
                if (typeof lon !== 'number' || typeof lat !== 'number') return;
                if (isNaN(lon) || isNaN(lat)) return;

                if (lon < minLon) minLon = lon;
                if (lat < minLat) minLat = lat;
                if (lon > maxLon) maxLon = lon;
                if (lat > maxLat) maxLat = lat;
            });
        };

        // Process all GeoJSON features to find bounds
        geoJSON.features.forEach(feature => {
            if (!feature.geometry) return;
            const geom = feature.geometry;

            if (geom.type === 'Polygon') {
                geom.coordinates.forEach(ring => processRing(ring));
            } else if (geom.type === 'MultiPolygon') {
                geom.coordinates.forEach(polygon => {
                    polygon.forEach(ring => processRing(ring));
                });
            }
        });

        // Safety fallback for India's approximate bounds
        if (minLon === Infinity || maxLon === -Infinity || minLat === Infinity || maxLat === -Infinity) {
            return { minLon: 68, minLat: 6, maxLon: 98, maxLat: 38 };
        }

        return { minLon, minLat, maxLon, maxLat };
    },

    // Convert Geometry to SVG Path String with proper MultiPolygon support
    generatePathData(geometry, project) {
        if (!geometry || !geometry.type) return '';

        const processRing = (ring) => {
            // Filter out invalid rings: must have at least 3 coordinates
            // and coordinates must be valid numbers
            if (!Array.isArray(ring) || ring.length < 3) return '';

            // Validate that coordinates are valid
            const validCoords = ring.filter(coord =>
                Array.isArray(coord) &&
                coord.length >= 2 &&
                typeof coord[0] === 'number' &&
                typeof coord[1] === 'number' &&
                !isNaN(coord[0]) &&
                !isNaN(coord[1])
            );

            if (validCoords.length < 3) return '';

            // Project all coordinates and build path
            const pathCommands = validCoords.map((coord, i) => {
                const p = project(coord[0], coord[1]);
                return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`;
            });

            return pathCommands.join(' ') + 'Z';
        };

        let paths = [];

        if (geometry.type === 'Polygon') {
            // Process all rings in the polygon (exterior + holes)
            geometry.coordinates.forEach(ring => {
                const ringPath = processRing(ring);
                if (ringPath) paths.push(ringPath);
            });
        } else if (geometry.type === 'MultiPolygon') {
            // Process each polygon in the MultiPolygon
            geometry.coordinates.forEach(polygon => {
                // Each polygon can have multiple rings (exterior + holes)
                polygon.forEach(ring => {
                    const ringPath = processRing(ring);
                    if (ringPath) paths.push(ringPath);
                });
            });
        }

        // Join all valid paths into a single SVG path string
        // This creates one continuous path that can include multiple disconnected regions
        return paths.filter(p => p.length > 5).join(' ');
    },

    normalizeName(name) {
        if (!name) return '';
        return name.toLowerCase()
            .replace(/&/g, 'and')
            .replace(/\s+/g, ' ')
            .trim();
    },

    getColor(normName) {
        // Fallback or specific logic
        // Use realistic color from data if available
        if (this.stateData[normName]) {
            return this.stateData[normName].color;
        }

        if (normName.includes('jammu')) return this.stateData['jammu and kashmir'].color;
        if (normName.includes('nicobar')) return this.stateData['andaman and nicobar'].color;
        if (normName.includes('delhi')) return this.stateData['delhi'].color;

        return '#94a3b8'; // Default grey
    },

    // --- Interaction Handlers ---

    activeTooltip: null,

    addTooltip(element, text) {
        element.addEventListener('mousemove', (e) => {
            if (!this.activeTooltip) {
                this.activeTooltip = document.createElement('div');
                this.activeTooltip.className = 'map-tooltip';
                document.body.appendChild(this.activeTooltip);
            }
            this.activeTooltip.innerHTML = text;
            this.activeTooltip.style.display = 'block';
            this.activeTooltip.style.left = e.pageX + 15 + 'px';
            this.activeTooltip.style.top = e.pageY + 15 + 'px';
        });

        element.addEventListener('mouseleave', () => {
            if (this.activeTooltip) {
                this.activeTooltip.style.display = 'none';
            }
        });
    },

    onStateHover(e, path) {
        // Only effect if not active
        if (this.activeState !== path) {
            // Apply simple hover class - CSS handles animation
            path.parentElement.appendChild(path); // Bring to front
        }
    },

    onStateLeave(e, path) {
        // Handled by CSS removal of hover state
    },

    clearActiveState() {
        if (this.activeState) {
            this.activeState.classList.remove('active');
            this.activeState = null;
        }
    },

    onStateClick(feature) {
        // Identify clicked path
        const rawName = feature.properties.NAME_1 || feature.properties.ST_NM || feature.properties.name;
        const selector = `.state-path[data-name="${rawName}"]`;
        const path = this.container.querySelector(selector);

        if (!path) return;

        // Toggle Logic
        if (this.activeState && this.activeState !== path) {
            this.activeState.classList.remove('active');
        }

        path.classList.add('active');
        this.activeState = path;

        // Bring active to front
        path.parentElement.appendChild(path);

        // Open Modal Flow
        this.openModal(rawName);
    },

    async openModal(stateName) {
        // Show the modal
        this.modal.classList.add('visible');

        // Update Modal Content
        document.getElementById('modal-state-name').textContent = stateName;

        // Generate State Visual
        this.updateStateVisual(stateName);

        // Get realistic data or fallback
        const normalized = this.normalizeName(stateName);
        const data = this.stateData[normalized] || {
            population: 5000000,
            growthRate: 0.01,
            birthRate: 18.0,
            deathRate: 6.0,
            reviewScore: 4.0,
            diseases: { "Viral Fever": 40, "Flu": 30, "Other": 30 }
        };

        // Deterministic Calculation
        const liveStats = this.calculateLiveStats(data);

        // Animate Numbers
        this.animateNumber('modal-population', liveStats.population);

        // Use Fixed Review Score
        const reviewScore = (data.reviewScore || 4.2).toFixed(1);
        document.getElementById('modal-live-users').innerText = `${reviewScore}/5`;

        // Update stats breakdown boxes with top 3 diseases
        const topDiseases = Object.keys(data.diseases);

        const statBoxes = document.querySelectorAll('.disease-stat');
        if (statBoxes.length >= 3) {
            const d1 = topDiseases[0] || "Dengue";
            const d2 = topDiseases[1] || "Malaria";
            const d3 = topDiseases[2] || "Flu";

            // Update Labels
            statBoxes[0].querySelector('.disease-stat-label').textContent = d1;
            statBoxes[1].querySelector('.disease-stat-label').textContent = d2;
            statBoxes[2].querySelector('.disease-stat-label').textContent = d3;

            // Calculate Counts relative to population
            const scale = liveStats.population / 10000;
            const v1 = Math.floor((data.diseases[d1] / 100) * scale * 0.8);
            const v2 = Math.floor((data.diseases[d2] / 100) * scale * 0.8);
            const v3 = Math.floor((data.diseases[d3] / 100) * scale * 0.8);

            statBoxes[0].querySelector('.disease-stat-value').textContent = "0"; // Reset for animation
            this.animateNumberElement(statBoxes[0].querySelector('.disease-stat-value'), v1);

            statBoxes[1].querySelector('.disease-stat-value').textContent = "0";
            this.animateNumberElement(statBoxes[1].querySelector('.disease-stat-value'), v2);

            statBoxes[2].querySelector('.disease-stat-value').textContent = "0";
            this.animateNumberElement(statBoxes[2].querySelector('.disease-stat-value'), v3);
        }

        document.getElementById('modal-born').textContent = liveStats.born;
        document.getElementById('modal-died').textContent = liveStats.died;

        // Reset Active State (Default: Total Population)
        const dataBoxes = this.modal.querySelectorAll('.data-box');
        dataBoxes.forEach(b => b.classList.remove('active'));
        // Set first box (Population) as active by default
        if (dataBoxes[0]) dataBoxes[0].classList.add('active');

        // Start Charts with state-specific disease data
        this.renderDiseaseChart(data.diseases);
    },

    closeModal() {
        this.modal.classList.remove('visible');
        if (this.hospitalsModal) this.hospitalsModal.classList.remove('visible');

        // Clear activity
        this.clearActiveState();
    },

    updateStateVisual(stateName) {
        // Try to clone the path from the main map to show in modal
        const container = document.getElementById('modal-state-visual');
        container.innerHTML = '';

        // Create a mini SVG for the modal
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", "0 0 200 200"); // Arbitrary, will need centering
        svg.setAttribute("class", "popout-svg");

        // Find existing path data
        const existingPath = this.container.querySelector(`.state-path[data-name="${stateName}"]`);
        if (existingPath) {
            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", existingPath.getAttribute("d"));
            path.setAttribute("fill", existingPath.getAttribute("fill"));
            path.setAttribute("class", "state-cutout-path");

            // We need to re-center this path inside the 200x200 viewbox
            // Simplest way: get BBox of path and adjust viewBox
            svg.appendChild(path);
            container.appendChild(svg);

            // Validating BBox requires the element to be in DOM.
            // Since we just appended, we can try to measure.
            try {
                const bbox = existingPath.getBBox();
                svg.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
            } catch (e) {
                // Fallback if measurement fails
            }
        }
    },

    animateNumber(id, finalValue) {
        const el = document.getElementById(id);
        if (!el) return;
        const duration = 1500;
        const start = 0;
        const end = Math.floor(finalValue);
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out

            el.textContent = Math.floor(start + (end - start) * ease).toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        requestAnimationFrame(update);
    },

    animateNumberElement(el, finalValue) {
        if (!el) return;
        const duration = 1500;
        const start = 0;
        const end = Math.floor(finalValue);
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out

            el.textContent = Math.floor(start + (end - start) * ease).toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        requestAnimationFrame(update);
    },

    renderDiseaseChart(diseaseData) {
        const ctx = document.getElementById('disease-chart').getContext('2d');
        if (this.diseaseChart) this.diseaseChart.destroy();

        if (typeof Chart === 'undefined') return;

        // Default mock if no data provided
        const labels = diseaseData ? Object.keys(diseaseData) : ['Dengue', 'Malaria', 'COVID-19', 'Typhoid', 'Flu'];
        const values = diseaseData ? Object.values(diseaseData) : [25, 20, 15, 25, 15];

        this.diseaseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: ['#f97316', '#22c55e', '#ef4444', '#eab308', '#3b82f6'],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            boxWidth: 12,
                            font: { size: 10 }
                        }
                    }
                },
                layout: { padding: 10 },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    },

    showHospitalsList() {
        this.hospitalsModal.classList.add('visible');
        // Mock data population...
        const list = document.getElementById('hospitals-list');
        list.innerHTML = `<div class="loading-hospitals"><div class="spinner"></div>Loading...</div>`;

        setTimeout(() => {
            list.innerHTML = `
                <div style="padding:1rem; color:#64748b; text-align:center;">
                    <p>Demonstration Data</p>
                    <div style="margin-top:10px; text-align:left;">
                        <div style="background:#f1f5f9; padding:15px; margin-bottom:10px; border-radius:10px;">
                            <strong>City General Hospital</strong><br>
                            <span style="font-size:0.9em">Central District • 2.4km away</span>
                        </div>
                        <div style="background:#f1f5f9; padding:15px; margin-bottom:10px; border-radius:10px;">
                            <strong>Apollo Specialty Centre</strong><br>
                            <span style="font-size:0.9em">Tech Park Road • 5.1km away</span>
                        </div>
                    </div>
                </div>
            `;
        }, 1000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    IndiaMap.init();
});
