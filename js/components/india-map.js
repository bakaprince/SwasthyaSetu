/**
 * Modern Interactive SVG India Map
 * Enhanced with grouped disease chart and hospitals popup
 */

const IndiaMap = {
    container: null,
    svgElement: null,
    tooltip: null,
    modal: null,
    hospitalsModal: null,
    diseaseChart: null,
    liveInterval: null,
    currentState: null,

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

    // State short names
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

    // Disease data - per million population rates
    diseaseRates: {
        "COVID-19": { active: 50, recovered: 2500, deceased: 45 },
        "Dengue": { active: 15, recovered: 800, deceased: 8 },
        "Malaria": { active: 20, recovered: 600, deceased: 12 },
        "Typhoid": { active: 10, recovered: 400, deceased: 6 },
        "Tuberculosis": { active: 80, recovered: 1500, deceased: 35 },
        "Heart Disease": { active: 200, recovered: 3000, deceased: 180 }
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
        this.createHospitalsModal();
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
            padding: 12px 20px;
            border-radius: 10px;
            font-size: 16px;
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

    createModal() {
        this.modal = document.createElement('div');
        this.modal.id = 'state-detail-modal';
        this.modal.className = 'state-popout-modal';
        this.modal.innerHTML = `
            <div class="popout-backdrop" onclick="IndiaMap.closeModal()"></div>
            <div class="popout-container">
                <button class="popout-close" onclick="IndiaMap.closeModal()">
                    <span class="material-icons-outlined">close</span>
                </button>

                <!-- State Visual -->
                <div class="popout-state-visual">
                    <svg id="popout-state-svg" class="popout-svg" viewBox="0 0 200 200"></svg>
                    <div class="state-name-overlay" id="popout-state-name">State Name</div>
                </div>
                
                <!-- Live Population Box - BIGGER -->
                <div class="data-connector top-right">
                    <div class="connector-line"></div>
                    <div class="data-box live-population-box large">
                        <div class="data-box-header">
                            <span class="pulse-dot"></span>
                            Live Population
                        </div>
                        <div class="data-box-value large" id="popout-live-pop">--</div>
                        <div class="data-box-sub-grid">
                            <div class="stat-row born">
                                <span class="material-icons-outlined">trending_up</span>
                                <span class="stat-label">Born Today</span>
                                <span class="stat-number" id="popout-born">0</span>
                            </div>
                            <div class="stat-row died">
                                <span class="material-icons-outlined">trending_down</span>
                                <span class="stat-label">Died Today</span>
                                <span class="stat-number" id="popout-died">0</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Hospital Rating Box -->
                <div class="data-connector bottom-right">
                    <div class="connector-line"></div>
                    <div class="data-box hospital-rating-box">
                        <div class="data-box-header">
                            <span class="material-icons-outlined">local_hospital</span>
                            Avg. Hospital Rating
                        </div>
                        <div class="data-box-value">
                            <span id="popout-rating">--</span>
                            <span class="stars" id="popout-stars"></span>
                        </div>
                        <div class="data-box-sub" id="popout-hospitals-count">-- hospitals</div>
                    </div>
                </div>

                <!-- Disease Statistics Box -->
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
                                <span class="disease-stat-label">ACTIVE</span>
                            </div>
                            <div class="disease-stat recovered">
                                <span class="disease-stat-value" id="popout-recovered">--</span>
                                <span class="disease-stat-label">RECOVERED</span>
                            </div>
                            <div class="disease-stat deceased">
                                <span class="disease-stat-value" id="popout-deceased">--</span>
                                <span class="disease-stat-label">DECEASED</span>
                            </div>
                        </div>
                        <div class="disease-chart-container">
                            <canvas id="popout-disease-chart"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Footer Button -->
                <div class="popout-footer">
                    <button onclick="IndiaMap.showHospitals()" class="popout-action-btn">
                        <span class="material-icons-outlined">local_hospital</span>
                        View All Hospitals
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
    },

    // Create hospitals list modal
    createHospitalsModal() {
        this.hospitalsModal = document.createElement('div');
        this.hospitalsModal.id = 'hospitals-list-modal';
        this.hospitalsModal.className = 'hospitals-modal';
        this.hospitalsModal.innerHTML = `
            <div class="hospitals-backdrop" onclick="IndiaMap.closeHospitals()"></div>
            <div class="hospitals-content">
                <div class="hospitals-header">
                    <h2 id="hospitals-title">Hospitals in State</h2>
                    <button class="hospitals-close" onclick="IndiaMap.closeHospitals()">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                <div class="hospitals-search">
                    <span class="material-icons-outlined">search</span>
                    <input type="text" id="hospital-search" placeholder="Search hospitals..." oninput="IndiaMap.filterHospitals()">
                </div>
                <div class="hospitals-list" id="hospitals-list">
                    <div class="loading-hospitals">
                        <div class="spinner"></div>
                        <p>Loading hospitals...</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.hospitalsModal);
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
            <pattern id="grid-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="1" fill="rgba(17,56,65,0.08)"/>
            </pattern>
            <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        `;
        svg.appendChild(defs);

        // Background pattern
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('width', '100%');
        bg.setAttribute('height', '100%');
        bg.setAttribute('fill', 'url(#grid-pattern)');
        svg.appendChild(bg);

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

    async onStateClick(e, stateName, pathData, stateColor) {
        this.currentState = stateName;
        const population = this.statePopulation[stateName] || 50;
        const rating = this.stateHospitalRatings[stateName] || 3.5;
        const hospitals = Math.floor(population * 15 + Math.random() * 100);

        const rect = e.target.getBoundingClientRect();
        const originX = rect.left + rect.width / 2;
        const originY = rect.top + rect.height / 2;

        this.modal.style.setProperty('--origin-x', `${originX}px`);
        this.modal.style.setProperty('--origin-y', `${originY}px`);

        document.getElementById('popout-state-name').textContent = stateName;
        document.getElementById('popout-rating').textContent = rating.toFixed(1);
        document.getElementById('popout-stars').textContent = this.getStars(rating);
        document.getElementById('popout-hospitals-count').textContent = `${hospitals} hospitals`;

        this.renderAnimatedCutout(pathData, stateColor);
        this.startLiveCounter(population);
        this.calculateDiseaseStats(population);
        this.createGroupedDiseaseChart(population);

        this.modal.classList.add('visible');
    },

    calculateDiseaseStats(populationMillions) {
        let totalActive = 0, totalRecovered = 0, totalDeceased = 0;

        Object.values(this.diseaseRates).forEach(rate => {
            totalActive += Math.floor((rate.active + (Math.random() - 0.5) * rate.active * 0.3) * populationMillions);
            totalRecovered += Math.floor((rate.recovered + (Math.random() - 0.5) * rate.recovered * 0.2) * populationMillions);
            totalDeceased += Math.floor((rate.deceased + (Math.random() - 0.5) * rate.deceased * 0.3) * populationMillions);
        });

        document.getElementById('popout-active').textContent = this.formatNumber(totalActive);
        document.getElementById('popout-recovered').textContent = this.formatNumber(totalRecovered);
        document.getElementById('popout-deceased').textContent = this.formatNumber(totalDeceased);
    },

    createGroupedDiseaseChart(populationMillions) {
        const ctx = document.getElementById('popout-disease-chart');
        if (!ctx) return;

        if (this.diseaseChart) {
            this.diseaseChart.destroy();
        }

        const diseases = Object.keys(this.diseaseRates);
        const activeData = diseases.map(d => Math.floor(this.diseaseRates[d].active * populationMillions * (0.8 + Math.random() * 0.4)));
        const recoveredData = diseases.map(d => Math.floor(this.diseaseRates[d].recovered * populationMillions * (0.8 + Math.random() * 0.4)));
        const deceasedData = diseases.map(d => Math.floor(this.diseaseRates[d].deceased * populationMillions * (0.8 + Math.random() * 0.4)));

        this.diseaseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: diseases,
                datasets: [
                    {
                        label: 'Active',
                        data: activeData,
                        backgroundColor: '#f97316',
                        borderRadius: 4
                    },
                    {
                        label: 'Recovered',
                        data: recoveredData,
                        backgroundColor: '#22c55e',
                        borderRadius: 4
                    },
                    {
                        label: 'Deceased',
                        data: deceasedData,
                        backgroundColor: '#ef4444',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            padding: 10,
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.x.toLocaleString()}`
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: false,
                        grid: { display: false },
                        ticks: {
                            font: { size: 10 },
                            callback: (val) => {
                                if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
                                if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
                                return val;
                            }
                        }
                    },
                    y: {
                        stacked: false,
                        grid: { display: false },
                        ticks: { font: { size: 11, weight: '500' } }
                    }
                }
            }
        });
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

    formatNumber(num) {
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toLocaleString();
    },

    // Show hospitals popup
    async showHospitals() {
        if (!this.currentState) return;

        document.getElementById('hospitals-title').textContent = `Hospitals in ${this.currentState}`;
        this.hospitalsModal.classList.add('visible');

        // Fetch hospitals
        await this.fetchHospitals(this.currentState);
    },

    async fetchHospitals(stateName) {
        const listContainer = document.getElementById('hospitals-list');
        listContainer.innerHTML = `
            <div class="loading-hospitals">
                <div class="spinner"></div>
                <p>Finding hospitals...</p>
            </div>
        `;

        try {
            // Get state coordinates (approximate center)
            const stateCoords = {
                "Uttar Pradesh": { lat: 26.8467, lng: 80.9462 },
                "Maharashtra": { lat: 19.7515, lng: 75.7139 },
                "Bihar": { lat: 25.0961, lng: 85.3131 },
                "Rajasthan": { lat: 27.0238, lng: 74.2179 },
                "Karnataka": { lat: 15.3173, lng: 75.7139 },
                "Tamil Nadu": { lat: 11.1271, lng: 78.6569 },
                "Gujarat": { lat: 22.2587, lng: 71.1924 },
                "Kerala": { lat: 10.8505, lng: 76.2711 },
                "Delhi": { lat: 28.7041, lng: 77.1025 },
                "NCT of Delhi": { lat: 28.7041, lng: 77.1025 },
                "West Bengal": { lat: 22.9868, lng: 87.8550 },
                "Telangana": { lat: 18.1124, lng: 79.0193 },
                "Andhra Pradesh": { lat: 15.9129, lng: 79.7400 },
                "Madhya Pradesh": { lat: 22.9734, lng: 78.6569 },
                "Punjab": { lat: 31.1471, lng: 75.3412 },
                "Haryana": { lat: 29.0588, lng: 76.0856 },
                "Odisha": { lat: 20.9517, lng: 85.0985 },
                "Orissa": { lat: 20.9517, lng: 85.0985 },
                "Jharkhand": { lat: 23.6102, lng: 85.2799 },
                "Chhattisgarh": { lat: 21.2787, lng: 81.8661 },
                "Assam": { lat: 26.2006, lng: 92.9376 },
                "Jammu and Kashmir": { lat: 33.7782, lng: 76.5762 },
                "Uttarakhand": { lat: 30.0668, lng: 79.0193 },
                "Himachal Pradesh": { lat: 31.1048, lng: 77.1734 },
                "Goa": { lat: 15.2993, lng: 74.1240 }
            };

            const coords = stateCoords[stateName] || { lat: 20.5937, lng: 78.9629 };

            // Use Overpass API.to find hospitals
            const query = `
                [out:json][timeout:25];
                (
                    node["amenity"="hospital"](around:100000,${coords.lat},${coords.lng});
                    way["amenity"="hospital"](around:100000,${coords.lat},${coords.lng});
                );
                out center 20;
            `;

            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query
            });

            const data = await response.json();
            this.displayHospitals(data.elements || []);

        } catch (error) {
            console.error('Failed to fetch hospitals:', error);
            this.displayHospitals([]);
        }
    },

    displayHospitals(hospitals) {
        const listContainer = document.getElementById('hospitals-list');

        if (hospitals.length === 0) {
            listContainer.innerHTML = `
                <div class="no-hospitals">
                    <span class="material-icons-outlined">info</span>
                    <p>No hospitals found. Try searching manually.</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = hospitals.map((h, i) => {
            const name = h.tags?.name || `Hospital ${i + 1}`;
            const lat = h.lat || h.center?.lat;
            const lng = h.lon || h.center?.lon;
            const phone = h.tags?.phone || h.tags?.['contact:phone'] || '';
            const address = h.tags?.['addr:full'] || h.tags?.['addr:street'] || '';

            return `
                <div class="hospital-card" data-name="${name.toLowerCase()}">
                    <div class="hospital-icon">
                        <span class="material-icons-outlined">local_hospital</span>
                    </div>
                    <div class="hospital-info">
                        <h3>${name}</h3>
                        ${address ? `<p class="hospital-address">${address}</p>` : ''}
                        ${phone ? `<p class="hospital-phone">${phone}</p>` : ''}
                    </div>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" 
                       target="_blank" 
                       class="navigate-btn">
                        <span class="material-icons-outlined">navigation</span>
                        Navigate
                    </a>
                </div>
            `;
        }).join('');
    },

    filterHospitals() {
        const query = document.getElementById('hospital-search').value.toLowerCase();
        const cards = document.querySelectorAll('.hospital-card');

        cards.forEach(card => {
            const name = card.dataset.name;
            card.style.display = name.includes(query) ? 'flex' : 'none';
        });
    },

    closeHospitals() {
        this.hospitalsModal.classList.remove('visible');
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
