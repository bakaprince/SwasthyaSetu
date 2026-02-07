/**
 * Modern Interactive SVG India Map
 * Enhanced with animated popout, live data, and disease statistics
 */

const IndiaMap = {
    container: null,
    svgElement: null,
    tooltip: null,
    modal: null,
    diseaseChart: null,
    liveInterval: null,

    // State population data (2024 Census projections in millions)
    statePopulation: {
        "Andaman and Nicobar": 0.4, "Andhra Pradesh": 53.9, "Arunachal Pradesh": 1.6,
        "Assam": 35.6, "Bihar": 127.0, "Chandigarh": 1.2, "Chhattisgarh": 30.0,
        "Dadra and Nagar Haveli": 0.6, "Daman and Diu": 0.3, "Delhi": 21.0, "Goa": 1.6,
        "Gujarat": 71.0, "Haryana": 30.0, "Himachal Pradesh": 7.5, "Jammu and Kashmir": 14.0,
        "Jharkhand": 40.0, "Karnataka": 69.0, "Kerala": 35.7, "Ladakh": 0.3,
        "Lakshadweep": 0.07, "Madhya Pradesh": 87.0, "Maharashtra": 128.0, "Manipur": 3.2,
        "Meghalaya": 3.8, "Mizoram": 1.3, "Nagaland": 2.3, "Odisha": 47.0, "Orissa": 47.0,
        "Puducherry": 1.7, "Punjab": 31.0, "Rajasthan": 82.0, "Sikkim": 0.7,
        "Tamil Nadu": 78.0, "Telangana": 39.0, "Tripura": 4.2, "Uttar Pradesh": 235.0,
        "Uttarakhand": 11.5, "Uttaranchal": 11.5, "West Bengal": 101.0, "NCT of Delhi": 21.0
    },

    // Hospital ratings
    stateHospitalRatings: {
        "Andhra Pradesh": 4.1, "Arunachal Pradesh": 3.2, "Assam": 3.5, "Bihar": 3.0,
        "Chhattisgarh": 3.4, "Delhi": 4.3, "NCT of Delhi": 4.3, "Goa": 4.5, "Gujarat": 4.2,
        "Haryana": 3.8, "Himachal Pradesh": 4.0, "Jammu and Kashmir": 3.6, "Jharkhand": 3.2,
        "Karnataka": 4.4, "Kerala": 4.6, "Madhya Pradesh": 3.5, "Maharashtra": 4.3,
        "Manipur": 3.3, "Meghalaya": 3.4, "Mizoram": 3.5, "Nagaland": 3.2, "Odisha": 3.6,
        "Orissa": 3.6, "Punjab": 4.0, "Rajasthan": 3.7, "Sikkim": 3.8, "Tamil Nadu": 4.5,
        "Telangana": 4.2, "Tripura": 3.4, "Uttar Pradesh": 3.3, "Uttarakhand": 3.9,
        "Uttaranchal": 3.9, "West Bengal": 3.8, "Ladakh": 3.0
    },

    // Unique colors for each state
    stateColors: {
        "Jammu and Kashmir": "#a8d5ba", "Himachal Pradesh": "#ffd6a5", "Punjab": "#fdffb6",
        "Chandigarh": "#caffbf", "Uttarakhand": "#9bf6ff", "Uttaranchal": "#9bf6ff",
        "Haryana": "#a0c4ff", "Delhi": "#bdb2ff", "NCT of Delhi": "#bdb2ff",
        "Rajasthan": "#ffc6ff", "Uttar Pradesh": "#ffadad", "Bihar": "#ffd6a5",
        "Sikkim": "#caffbf", "Arunachal Pradesh": "#9bf6ff", "Nagaland": "#a0c4ff",
        "Manipur": "#bdb2ff", "Mizoram": "#ffc6ff", "Tripura": "#ffadad",
        "Meghalaya": "#fdffb6", "Assam": "#a8d5ba", "West Bengal": "#ffd6a5",
        "Jharkhand": "#caffbf", "Odisha": "#9bf6ff", "Orissa": "#9bf6ff",
        "Chhattisgarh": "#a0c4ff", "Madhya Pradesh": "#bdb2ff", "Gujarat": "#ffc6ff",
        "Daman and Diu": "#ffadad", "Dadra and Nagar Haveli": "#fdffb6",
        "Maharashtra": "#a8d5ba", "Andhra Pradesh": "#ffd6a5", "Karnataka": "#caffbf",
        "Goa": "#9bf6ff", "Lakshadweep": "#a0c4ff", "Kerala": "#bdb2ff",
        "Tamil Nadu": "#ffc6ff", "Puducherry": "#ffadad", "Andaman and Nicobar": "#fdffb6",
        "Telangana": "#a8d5ba", "Ladakh": "#e8f4f8"
    },

    // Short names for state labels
    stateShortNames: {
        "Andaman and Nicobar": "A&N", "Andhra Pradesh": "AP", "Arunachal Pradesh": "AR",
        "Assam": "AS", "Bihar": "BR", "Chandigarh": "CH", "Chhattisgarh": "CG",
        "Dadra and Nagar Haveli": "DNH", "Daman and Diu": "DD", "Delhi": "DL",
        "NCT of Delhi": "DL", "Goa": "GA", "Gujarat": "GJ", "Haryana": "HR",
        "Himachal Pradesh": "HP", "Jammu and Kashmir": "JK", "Jharkhand": "JH",
        "Karnataka": "KA", "Kerala": "KL", "Lakshadweep": "LD", "Madhya Pradesh": "MP",
        "Maharashtra": "MH", "Manipur": "MN", "Meghalaya": "ML", "Mizoram": "MZ",
        "Nagaland": "NL", "Odisha": "OD", "Orissa": "OD", "Puducherry": "PY",
        "Punjab": "PB", "Rajasthan": "RJ", "Sikkim": "SK", "Tamil Nadu": "TN",
        "Telangana": "TS", "Tripura": "TR", "Uttar Pradesh": "UP",
        "Uttarakhand": "UK", "Uttaranchal": "UK", "West Bengal": "WB", "Ladakh": "LA"
    },

    // Disease statistics per state (estimates based on population)
    diseaseDeathRates: {
        "COVID-19": { base: 45, variance: 20 },
        "Dengue": { base: 8, variance: 5 },
        "Malaria": { base: 12, variance: 8 },
        "Typhoid": { base: 6, variance: 3 },
        "Tuberculosis": { base: 35, variance: 15 },
        "Heart Disease": { base: 180, variance: 40 }
    },

    async init() {
        console.log('[IndiaMap] Initializing...');

        this.container = document.getElementById('india-map');
        if (!this.container) {
            console.error('[IndiaMap] Container not found');
            return;
        }

        this.createTooltip();
        this.createModal();
        await this.loadMap();

        console.log('[IndiaMap] Initialized successfully');
    },

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'india-map-tooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            background: #113841;
            color: #86efac;
            padding: 10px 18px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
            z-index: 1000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            white-space: nowrap;
        `;
        document.body.appendChild(this.tooltip);
    },

    // Create enhanced modal with formal styling
    createModal() {
        this.modal = document.createElement('div');
        this.modal.id = 'state-detail-modal';
        this.modal.className = 'state-popout-modal';
        this.modal.innerHTML = `
            <div class="popout-backdrop" onclick="IndiaMap.closeModal()"></div>
            <div class="popout-container">
                <!-- Close Button -->
                <button class="popout-close" onclick="IndiaMap.closeModal()">
                    <span class="material-icons-outlined">close</span>
                </button>

                <!-- Animated State Cutout in Center -->
                <div class="popout-state-visual">
                    <svg id="popout-state-svg" class="popout-svg" viewBox="0 0 200 200"></svg>
                    <div class="state-name-overlay" id="popout-state-name">State Name</div>
                </div>
                
                <!-- Connection Lines with Data Boxes -->
                <div class="data-connector top-right">
                    <div class="connector-line"></div>
                    <div class="data-box live-population-box">
                        <div class="data-box-header">
                            <span class="pulse-dot"></span>
                            Live Population
                        </div>
                        <div class="data-box-value" id="popout-live-pop">--</div>
                        <div class="data-box-sub">
                            <span class="stat-item born">
                                <span class="material-icons-outlined">child_care</span>
                                <span id="popout-born">0</span>
                            </span>
                            <span class="stat-item died">
                                <span class="material-icons-outlined">trending_down</span>
                                <span id="popout-died">0</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="data-connector bottom-right">
                    <div class="connector-line"></div>
                    <div class="data-box hospital-rating-box">
                        <div class="data-box-header">
                            <span class="material-icons-outlined">local_hospital</span>
                            Avg. Hospital Rating
                        </div>
                        <div class="data-box-value">
                            <span id="popout-rating">--</span>
                            <span class="stars" id="popout-stars">★★★★☆</span>
                        </div>
                        <div class="data-box-sub" id="popout-hospitals">-- hospitals</div>
                    </div>
                </div>

                <div class="data-connector left-side">
                    <div class="connector-line"></div>
                    <div class="data-box disease-box">
                        <div class="data-box-header">
                            <span class="material-icons-outlined">coronavirus</span>
                            Disease Statistics
                        </div>
                        <div class="disease-stats-grid">
                            <div class="disease-stat active">
                                <span class="disease-stat-value" id="popout-active">--</span>
                                <span class="disease-stat-label">Active Cases</span>
                            </div>
                            <div class="disease-stat recovered">
                                <span class="disease-stat-value" id="popout-recovered">--</span>
                                <span class="disease-stat-label">Recovered</span>
                            </div>
                            <div class="disease-stat deceased">
                                <span class="disease-stat-value" id="popout-deceased">--</span>
                                <span class="disease-stat-label">Deceased</span>
                            </div>
                        </div>
                        <div class="disease-chart-container">
                            <canvas id="popout-disease-chart"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- View Hospitals Button - Fixed at bottom -->
                <div class="popout-footer">
                    <a href="#" id="popout-hospitals-link" class="popout-action-btn">
                        <span class="material-icons-outlined">local_hospital</span>
                        View All Hospitals
                    </a>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
    },

    async loadMap() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson');
            const geoJSON = await response.json();
            this.renderSVGMap(geoJSON);
        } catch (error) {
            console.error('[IndiaMap] Failed to load map:', error);
            this.container.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;">
                    <span class="material-icons-outlined" style="margin-right:8px;">error</span>
                    Failed to load map
                </div>
            `;
        }
    },

    renderSVGMap(geoJSON) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        geoJSON.features.forEach(feature => {
            const coords = this.getAllCoords(feature.geometry);
            coords.forEach(([lon, lat]) => {
                minX = Math.min(minX, lon);
                maxX = Math.max(maxX, lon);
                minY = Math.min(minY, lat);
                maxY = Math.max(maxY, lat);
            });
        });

        const padding = 2;
        minX -= padding; minY -= padding;
        maxX += padding; maxY += padding;

        const width = 600;
        const height = 720;

        const scaleX = (lon) => ((lon - minX) / (maxX - minX)) * width;
        const scaleY = (lat) => height - ((lat - minY) / (maxY - minY)) * height;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('class', 'india-svg-map');
        svg.style.cssText = 'width: 100%; height: 100%;';

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        `;
        svg.appendChild(defs);

        const statesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        statesGroup.setAttribute('class', 'states-group');

        const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        labelGroup.setAttribute('class', 'labels-group');

        geoJSON.features.forEach(feature => {
            const stateName = feature.properties.NAME_1 || feature.properties.name || feature.properties.ST_NM || 'Unknown';
            const pathData = this.geoToPath(feature.geometry, scaleX, scaleY);

            if (!pathData) return;

            const stateColor = this.stateColors[stateName] || '#f0f0f0';

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('class', 'state-path');
            path.setAttribute('id', `state-${stateName.replace(/\s+/g, '-')}`);
            path.setAttribute('data-state', stateName);
            path.setAttribute('data-original-path', pathData);
            path.setAttribute('data-color', stateColor);
            path.style.fill = stateColor;

            path.addEventListener('mouseenter', (e) => this.onStateHover(e, stateName, path));
            path.addEventListener('mousemove', (e) => this.moveTooltip(e));
            path.addEventListener('mouseleave', () => this.onStateLeave(path));
            path.addEventListener('click', (e) => this.onStateClick(e, stateName, pathData, stateColor));

            statesGroup.appendChild(path);

            // Add label
            const coords = this.getAllCoords(feature.geometry);
            if (coords.length > 0) {
                let sumX = 0, sumY = 0;
                coords.forEach(([lon, lat]) => {
                    sumX += scaleX(lon);
                    sumY += scaleY(lat);
                });
                const centerX = sumX / coords.length;
                const centerY = sumY / coords.length;

                const shortName = this.stateShortNames[stateName] || stateName.substring(0, 2).toUpperCase();
                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', centerX);
                label.setAttribute('y', centerY);
                label.setAttribute('class', 'state-label');
                label.setAttribute('text-anchor', 'middle');
                label.setAttribute('dominant-baseline', 'middle');
                label.textContent = shortName;
                labelGroup.appendChild(label);
            }
        });

        svg.appendChild(statesGroup);
        svg.appendChild(labelGroup);

        this.container.innerHTML = '';
        this.container.appendChild(svg);
        this.svgElement = svg;
    },

    getAllCoords(geometry) {
        const coords = [];
        const extract = (arr) => {
            if (typeof arr[0] === 'number') {
                coords.push(arr);
            } else {
                arr.forEach(extract);
            }
        };
        if (geometry.coordinates) {
            extract(geometry.coordinates);
        }
        return coords;
    },

    geoToPath(geometry, scaleX, scaleY) {
        let path = '';

        const renderRing = (ring) => {
            return ring.map((coord, i) => {
                const x = scaleX(coord[0]);
                const y = scaleY(coord[1]);
                return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
            }).join(' ') + ' Z';
        };

        if (geometry.type === 'Polygon') {
            geometry.coordinates.forEach(ring => {
                path += renderRing(ring) + ' ';
            });
        } else if (geometry.type === 'MultiPolygon') {
            geometry.coordinates.forEach(polygon => {
                polygon.forEach(ring => {
                    path += renderRing(ring) + ' ';
                });
            });
        }

        return path.trim();
    },

    onStateHover(e, stateName, path) {
        path.classList.add('hovered');
        this.tooltip.textContent = stateName;
        this.tooltip.style.opacity = '1';
        this.moveTooltip(e);
    },

    moveTooltip(e) {
        this.tooltip.style.left = (e.clientX + 15) + 'px';
        this.tooltip.style.top = (e.clientY - 10) + 'px';
    },

    onStateLeave(path) {
        path.classList.remove('hovered');
        this.tooltip.style.opacity = '0';
    },

    // Enhanced click handler
    async onStateClick(e, stateName, pathData, stateColor) {
        const population = this.statePopulation[stateName] || 50;
        const rating = this.stateHospitalRatings[stateName] || 3.5;
        const hospitals = Math.floor(population * 15 + Math.random() * 100);

        // Get click position for animation origin
        const rect = e.target.getBoundingClientRect();
        const originX = rect.left + rect.width / 2;
        const originY = rect.top + rect.height / 2;

        this.modal.style.setProperty('--origin-x', `${originX}px`);
        this.modal.style.setProperty('--origin-y', `${originY}px`);

        // Update content
        document.getElementById('popout-state-name').textContent = stateName;
        document.getElementById('popout-rating').textContent = rating.toFixed(1);
        document.getElementById('popout-stars').textContent = this.getStars(rating);
        document.getElementById('popout-hospitals').textContent = `${hospitals} hospitals`;
        document.getElementById('popout-hospitals-link').href = `hospitals.html?state=${encodeURIComponent(stateName)}`;

        // Render state cutout
        this.renderAnimatedCutout(pathData, stateColor);

        // Start live population counter
        this.startLiveCounter(population);

        // Fetch and display disease data
        await this.fetchDiseaseData(stateName, population);

        // Create disease death chart
        this.createDiseaseChart(stateName, population);

        // Show modal
        this.modal.classList.add('visible');
    },

    // Fetch disease data from API or simulate
    async fetchDiseaseData(stateName, populationMillions) {
        // Simulate API data based on population (realistic estimates)
        const baseActive = Math.floor(populationMillions * 50 + Math.random() * 1000);
        const baseRecovered = Math.floor(populationMillions * 2500 + Math.random() * 5000);
        const baseDeceased = Math.floor(populationMillions * 35 + Math.random() * 100);

        document.getElementById('popout-active').textContent = this.formatNumber(baseActive);
        document.getElementById('popout-recovered').textContent = this.formatNumber(baseRecovered);
        document.getElementById('popout-deceased').textContent = this.formatNumber(baseDeceased);
    },

    renderAnimatedCutout(pathData, stateColor) {
        const cutoutSvg = document.getElementById('popout-state-svg');

        const coords = pathData.match(/[\d.]+,[\d.]+/g) || [];
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        coords.forEach(coord => {
            const [x, y] = coord.split(',').map(Number);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });

        const padding = 15;
        const viewBox = `${minX - padding} ${minY - padding} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`;

        cutoutSvg.setAttribute('viewBox', viewBox);
        cutoutSvg.innerHTML = `
            <path class="state-cutout-path" d="${pathData}" fill="${stateColor}" stroke="#113841" stroke-width="2"/>
        `;
    },

    getStars(rating) {
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
    },

    startLiveCounter(populationMillions) {
        if (this.liveInterval) clearInterval(this.liveInterval);

        const basePopulation = populationMillions * 1000000;
        const birthRate = 17.0 / 1000;
        const deathRate = 7.3 / 1000;
        const secondsPerYear = 365.25 * 24 * 60 * 60;

        const birthsPerSecond = (basePopulation * birthRate) / secondsPerYear;
        const deathsPerSecond = (basePopulation * deathRate) / secondsPerYear;

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const secondsSinceMidnight = (now - todayStart) / 1000;

        let bornToday = Math.floor(birthsPerSecond * secondsSinceMidnight);
        let deathsToday = Math.floor(deathsPerSecond * secondsSinceMidnight);
        let aliveNow = basePopulation + bornToday - deathsToday;

        const update = () => {
            if (Math.random() > 0.4) bornToday += Math.floor(Math.random() * 3);
            if (Math.random() > 0.6) deathsToday += Math.floor(Math.random() * 2);
            aliveNow = basePopulation + bornToday - deathsToday;

            const livePopEl = document.getElementById('popout-live-pop');
            const bornEl = document.getElementById('popout-born');
            const diedEl = document.getElementById('popout-died');

            if (livePopEl) livePopEl.textContent = this.formatNumber(aliveNow);
            if (bornEl) bornEl.textContent = bornToday.toLocaleString();
            if (diedEl) diedEl.textContent = deathsToday.toLocaleString();
        };

        update();
        this.liveInterval = setInterval(update, 1000);
    },

    createDiseaseChart(stateName, populationMillions) {
        const ctx = document.getElementById('popout-disease-chart');
        if (!ctx) return;

        if (this.diseaseChart) {
            this.diseaseChart.destroy();
        }

        const diseases = Object.keys(this.diseaseDeathRates);
        const deathData = diseases.map(disease => {
            const rate = this.diseaseDeathRates[disease];
            const deaths = Math.floor((rate.base + (Math.random() - 0.5) * rate.variance) * populationMillions);
            return deaths;
        });

        this.diseaseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: diseases,
                datasets: [{
                    label: 'Deaths',
                    data: deathData,
                    backgroundColor: [
                        '#ef4444', '#f97316', '#eab308',
                        '#22c55e', '#3b82f6', '#8b5cf6'
                    ],
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.parsed.x.toLocaleString()} deaths`
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'logarithmic',
                        grid: { display: false },
                        ticks: {
                            font: { size: 10 },
                            callback: (val) => val >= 1000 ? (val / 1000) + 'k' : val
                        }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { font: { size: 11, weight: '500' } }
                    }
                }
            }
        });
    },

    formatNumber(num) {
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toLocaleString();
    },

    closeModal() {
        this.modal.classList.remove('visible');
        if (this.liveInterval) {
            clearInterval(this.liveInterval);
            this.liveInterval = null;
        }
        if (this.diseaseChart) {
            this.diseaseChart.destroy();
            this.diseaseChart = null;
        }
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => IndiaMap.init());
} else {
    IndiaMap.init();
}
